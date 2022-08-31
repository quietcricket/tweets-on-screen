const STATUS_PENDING = 'pending';
const STATUS_APPROVED = 'approved';
const STATUS_REJECTED = 'rejected';
const STATUS_LIST = [STATUS_PENDING, STATUS_APPROVED, STATUS_REJECTED];

/**
 * Renders a tweet as a dom element
 */
class BaseRenderer {
	constructor(custom_emojis = {}) {
	}
	render(entry) {
		let verified = entry.verified ? '<svg viewBox="0 0 24 24"><g ><path fill="rgba(29,161,242,1.00)"  d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"></path></g></svg>' : '';
		//
		let media = '';
		if (entry.photos) {
			media = entry.photos.map(p => `<img class="media" src="${p}" />`);
		}

		let ele = document.createElement('div');
		ele.setAttribute('eid', entry.tid);
		ele.className = 'tweet';
		ele.innerHTML = `
            <div class="tweet-header">
                <img class="profile" src="${entry.avatar}">
                <div class="name">
                    <h5>${entry.name}</h5>
                    ${verified}
                    <h6>@${entry.screen_name}</h6>
                </div>
            </div>
            <div class="tweet-body">${entry.text}</div>
            <div class="tweet-medias">${media}</div>
            <div class="timestamp">${this.formatDate(entry.created_at)}</div>
            `;
		ele.querySelectorAll('img[alt]').forEach(e => e.classList.add('emoji'));
		return ele;
	}

	/**
	 * Quite frequently the tweet ends with an emoji, which is double character
	 * Need to manually check when the display text should end
	 * Cannot rely on display_text_range
	 */
	trimText(entry) {
		var text = entry.full_text;
		var startIndex = entry.display_text_range[0];
		var endIndex = entry.display_text_range[1];
		while (true) {
			if (endIndex == text.length || text[endIndex] == ' ') break;
			endIndex++;
		}
		return text.substring(startIndex, endIndex);
	}

	/**
	 * Highlight links in blue color
	 */
	highlightLinks(entities, text) {
		if (!entities || !entities.urls) return text;
		for (let url of entities.urls) {
			text = text.replace(url.url, `<span class="highlight">${url.display_url}</span>`);
		}
		return text;
	}

	/**
	 * Highlight hashtags in blue color
	 */
	highlightHashtags(entities, text) {

		if (!entities || !entities.hashtags) return text;
		for (let h of entities.hashtags) {
			let emoji = this.custom_emojis[h.text.toLowerCase()];
			emoji = emoji ? `<img class="emoji" src="https://abs.twimg.com/hashflags/${emoji}"/>` : '';
			text = text.replace(`#${h.text}`, `<span class="highlight">#${h.text}</span>${emoji}`);
		}
		return text;
	}

	/**
	 * Extract media preview image or video
	 */
	expandMedia(entities, extended_entities) {
		/**
		 * Only display the first media if there are mutiple ones
		 * So far only see multiple images
		 */
		if (!entities || !entities.media) return '';
		for (let m of entities.media) {
			let video = this.expandVideo(extended_entities, m.tid);
			let w = m.original_info.width;
			let h = m.original_info.height;
			if (video) {
				return `<video class="media" src="${video}" loop autoplay muted w="${w}" h="${h}"></video>`;
			} else {
				return `<img class="media" src="${m.media_url_https}" w="${w}" h="${h}">`;
			}
		}

		return '';
	}

	expandVideo(extended_entities, media_id) {
		if (!extended_entities || !extended_entities.media) return null;
		for (let m of extended_entities.media) {
			if (m.tid == media_id && m.video_info) {
				for (let v of m.video_info.variants) {
					if (v.content_type == 'video/mp4') return v.url;
				}
			}
		}
		return null;
	}

	formatDate(date) {
		return date.substr(0, 20);
	}
}

class BaseLayout {
	constructor(renderer = new BaseRenderer(), containerSelector = '.tweets-container') {
		// when the db is synced, all entries added, change ready to true
		this.ready = false;
		this.container = document.querySelector(containerSelector);
		this.renderer = renderer;
	}

	addEntry(entry) {
		let ele = this.renderer.render(entry);
		this.container.prepend(ele);
		return ele;
	}

	removeEntry(eid) {
		this.container.removeChild(this._getElement(eid));
	}

	clear() {
		for (let ele of this.container.childNodes) this.container.removeChild(ele);

	}

	_getElement(eid) {
		return document.querySelector(`[eid="${eid}"]`)
	}
}


/**
 * Base Application
 * In charge of DB related logic
 * Call renderer and layout with data
 */
class BaseApp {
	constructor(layout) {
		this.layout = layout;
		this.db = firebase.firestore();
		this.db.enablePersistence({
			synchronizeTabs: true
		});
		this.db.collection('entry').onSnapshot(snapshot => this.entriesChanged(snapshot));
		this.allEntries = {};
		this.groups = {};
		STATUS_LIST.map(k => this.groups[k] = []);

		this.filter = STATUS_APPROVED;
	}

	get currentIds() {
		return this.groups[this.filter];
	}

	/**
	 * Monitors database changes
	 * Calls the layout manager to add and remove dom elements
	 */
	entriesChanged(snap) {
		let filteredIds = this.currentIds.slice();
		STATUS_LIST.map(k => this.groups[k] = []);
		this.allEntries = {};
		let ids = [];
		for (let doc of snap.docs) {
			let entry = doc.data();
			this.allEntries[entry.tid + ""] = entry;
			this.groups[entry.status].push(entry.tid);
			if (entry.status == this.filter) {
				ids.push(entry.tid);
				// Add entry if it is newly added
				if (!filteredIds.includes(entry.tid)) {
					this.layout.addEntry(entry);
				}
			}
		}

		for (let eid of filteredIds) {
			// Remove entry if it is removed
			if (!ids.includes(eid)) this.layout.removeEntry(eid);

		}
		this.layout.ready = true;
	}

	_getParam(key, fallback = undefined) {
		var v = new URLSearchParams(document.location.search).get(key);
		return v ? v : fallback
	}

}

export {
	STATUS_PENDING,
	STATUS_APPROVED,
	STATUS_REJECTED,
	BaseRenderer,
	BaseLayout,
	BaseApp
}
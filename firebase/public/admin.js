import {
    BaseApp,
    BaseRenderer,
    STATUS_PENDING,
    BaseLayout,
    STATUS_APPROVED,
    STATUS_REJECTED
} from "./base.js";


class AdminRenderer extends BaseRenderer {
    render(entry) {
        let ele = super.render(entry);
        let holder = document.createElement('div');
        let btns = {}
        var html = '';
        for (let k in btns) {
            if (k != filter) html += btns[k];
        }
        holder.innerHTML = `<button class="btn btn-success btn-approve btn-mod">Approve</button>
        <button class="btn btn-danger btn-reject btn-mod ">Reject</button>`;
        holder.className = 'mod-btns-holder';
        ele.append(holder);
        return ele;
    }
}

class AdminLayout extends BaseLayout {
    constructor() {
        super(new AdminRenderer());

        this.masonryHeight = 0;
        this.masonry = new Masonry(this.container, {
            gutter: 20,
            stagger: 30
        });
        setInterval(() => this.updateMasonry(), 200);
    }

    addEntry(entry) {
        let ele = super.addEntry(entry);
        this.masonry.prepended(ele);
        return ele;
    }

    removeEntry(tid) {
        this.masonry.remove(this._getElement(tid));
    }

    resetMasonry() {
        if (this.masonry) this.masonry.destroy();
        this.masonry = new Masonry(this.container, {
            gutter: 20,
            stagger: 30
        });
    }

    updateMasonry() {
        if (!this.masonry) return;
        var h = 0;
        for (let c of this.container.childNodes) {
            h += c.offsetHeight;
        }

        if (h != this.masonryHeight) {
            this.masonryHeight = h;
            this.masonry.layout();
        }
    }

    clear() {
        for (let ele of this.container.children) {
            this.masonry.remove(ele);
        }
        this.container.innerHTML = "";
    }
}


/**
 * Admin Application
 */
class AdminApp extends BaseApp {
    constructor() {
        super(new AdminLayout());
        this.filter = this._getParam('filter', STATUS_PENDING);
        this.updateNav();
        window.onpopstate = () => this.updateFilter();

        for (let l of document.querySelectorAll('.nav-link')) {
            l.addEventListener('click', evt => {
                document.querySelector('body').classList.remove(this.filter);
                this.filter = evt.currentTarget.getAttribute('filter');
                history.replaceState({}, {}, `${document.location.pathname}?filter=${this.filter}`);
                document.querySelector('body').classList.add(this.filter);
            });
        }
    }

    entriesChanged(snap) {
        super.entriesChanged(snap);
        for (let l of document.querySelectorAll('.nav-link')) {
            let status = l.getAttribute('filter');
            l.innerHTML = `${status} (${this.groups[status].length})`;
        }
        this.addBtnListeners();
    }

    updateFilter() {
        this.layout.clear();
        for (let tid of this.currentIds) {
            this.layout.addEntry(this.allEntries[tid]);
        }
        this.updateNav();
        this.addBtnListeners();
    }

    updateNav() {
        for (let l of document.querySelectorAll('.nav-link')) {
            let status = l.getAttribute('filter');
            if (status == this.filter) {
                l.classList.add('active');
            } else {
                l.classList.remove('active');
            }
        }
    }

    addBtnListeners() {
        for (let btn of document.querySelectorAll('.btn-mod')) {
            if (btn.hasAttribute('processed')) continue;
            btn.setAttribute('processed', '1');
            btn.addEventListener('click', evt => {
                let btn = evt.currentTarget;
                let t = btn.parentNode.parentNode;

                btn.innerHTML = 'saving...';
                btn.classList.add('disabled');
                t.style.pointerEvents = 'none';

                let ref = this.db.collection('entry').doc(t.getAttribute('tid'));
                ref.update({
                    status: btn.classList.contains('btn-approve') ? STATUS_APPROVED : STATUS_REJECTED
                });
            });
        }
    }
}

export {
    AdminApp
}
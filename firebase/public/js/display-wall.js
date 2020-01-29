import {
    BaseRenderer,
    BaseLayout,
    BaseApp,
    STATUS_APPROVED
} from "./base.js";

class WallRenderer extends BaseRenderer {
    render(entry) {
        let ele = super.render(entry);
        let logo = document.createElement('span');
        logo.innerHTML = '<svg viewBox="0 0 24 24"><g><path fill="rgba(29,161,242,1.00)" d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"></path></g></svg>'
        logo.className = "twitter-logo"
        ele.prepend(logo);
        return ele;
    }
}

class WallLayout extends BaseLayout {
    constructor() {
        super(new WallRenderer());
        this.parameters = { 'wall-cols': 3, 'wall-col-width': 400, 'wall-speed': 5 };
        this.index = 0;
        this.margin = 15;
        document.body.addEventListener('keydown', evt => {
            if (evt.key == 'p' || evt.key == 'P') {
                let p = document.querySelector('.parameters');
                p.style.display = p.style.display == 'none' ? 'block' : 'none';
            }
        });

        for (let k in this.parameters) {
            let v = localStorage.getItem(k);
            let ele = document.getElementById(k);
            ele.value = v ? v : this.parameters[k];
            this.parameters[k] = parseFloat(ele.value);
            ele.addEventListener('change', this.updateParameter);
        }

        this.colHeights = [];
        for (var i = 0; i < this.parameters['wall-cols']; i++) {
            this.colHeights.push(0);
        }
        this.tick();
        let cols = this.parameters['wall-cols'];
        let w = this.parameters['wall-col-width'];
        document.getElementById('dynamic-styles').innerHTML = `
        .tweets-wall{
            left:${(window.innerWidth-this.margin*(cols-1)-w*cols)/2}px;
            width:${this.margin*(cols-1)+w*cols}px;
        }
        .tweet{
            width:${w}px;
        }`;
        this.wall = document.querySelector('.tweets-wall');
    }

    updateParameter(evt) {
        localStorage.setItem(evt.currentTarget.id, evt.currentTarget.value);
    }

    tick() {
        window.requestAnimationFrame(t => this.tick());
        if (this.container.childElementCount == 0) {
            return;
        }
        if (this.wall.childElementCount == 0) {
            let cols = this.parameters['wall-cols'];
            let ys = Array(cols).fill(0);

            for (var i = 0; i < this.container.childElementCount; i++) {
                let col = i % cols;
                let cc = this.container.childNodes[i].cloneNode(true);
                cc.setAttribute('y', window.innerHeight);
                cc.style.left = this.parameters['wall-col-width'] * col + this.margin * (col - 1) + 'px';
                cc.style.top = ys[col] + 'px';
                this.wall.appendChild(cc);
                ys[col] += cc.offsetHeight + this.margin;
            }
        }
        for (let t of this.wall.childNodes) {
            let y = parseInt(t.getAttribute('y'));
            y -= this.parameters['wall-speed'];
            t.setAttribute('y', y);
            t.style.transform = `translate3d(0, ${y}px, 0)`;
        }
    }
}

window.app = new BaseApp(new WallLayout());
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

    /**
     * Some getters as shortcut to the parameters
     */
    get cols() {
        return this.parameters['cols'].value;
    }

    get width() {
        return this.parameters['width'].value;
    }

    get speed() {
        return this.parameters['speed'].value;
    }

    constructor() {
        super(new WallRenderer());
        this.parameters = {};
        this.columns = [];
        this.index = -1;
        this.MARGIN = 15;
        // Monitor key press of 'p' to show the parameters panel
        document.body.addEventListener('keydown', evt => {
            if (evt.key == 'p' || evt.key == 'P') {
                let p = document.querySelector('.parameters');
                p.style.display = p.style.display == 'none' ? 'block' : 'none';
            }
        });

        // Attache action to save button, to relayout the page based on the updated parameters
        document.getElementById('save-btn').addEventListener('click', evt => {
            this.reset();
            document.querySelector('.parameters').style.display = 'none';

        });

        // Initialize parameters and sycronize with save values
        this.parameters['cols'] = new Parameter('cols', parseInt);
        this.parameters['width'] = new Parameter('width', parseInt);
        this.parameters['speed'] = new Parameter('speed', parseInt);

        this.wall = document.querySelector('.tweets-wall');

        this.reset();
        this.tick();
    }

    /**
     * Overrite the default addEntry logic
     * Insert the new entry right after the current index so it shows up quickly
     * This does not the change how entries are inserted in initialization phase
     */
    addEntry(entry) {
        let ele = this.renderer.render(entry);
        // Insert right after the current index so it shows up quickly
        if (this.ready) {
            this.container.insertBefore(ele, this.container.childNodes[this.index]);
        } else {
            this.container.prepend(ele);
        }
        return ele;
    }


    reset() {
        if (!this.ready) {
            return setTimeout(() => this.reset(), 100);
        }
        this.index = -1;
        // Update stylesheets based on the parameters
        document.getElementById('dynamic-styles').innerHTML = `
                    .tweets-wall {
                        left: ${(window.innerWidth - this.MARGIN * (this.cols - 1) - this.width * this.cols) / 2 }px;
                        width: ${this.MARGIN * (this.cols - 1) + this.width * this.cols}px;
                    }
                    .tweet { width: ${this.width}px; } `;
        this.wall.innerHTML = '';
        this.columns = [];
        for (let i = 0; i < this.cols; i++) {
            this.columns[i] = new WallColumn(i, this.width, this.MARGIN);
            this.growColumn(this.columns[i]);
        }
    }

    tick() {
        window.requestAnimationFrame(t => this.tick());
        for (let c of this.columns) {
            if (c.update(this.speed)) {
                this.growColumn(c);
            }
        }
    }

    growColumn(c) {
        this.index = (this.index + 1) % this.container.childElementCount;
        let ele = this.container.childNodes[this.index].cloneNode(true);
        ele.style.transform = `translate(${window.innerWidth/2}px, 3000px)`;
        this.wall.appendChild(ele);
        c.add(ele);
    }
}

class Parameter {
    // Add a prefix for local storage key to avoid conflicts
    static PREFIX = 'tc-wall-';
    /**
     Most of the time it needs to be converted into Int or Float
     e.g. parseInt, parseFloat
     If no conversion is needed, return the value from localStorage or
     input as String
    */
    constructor(key, conversion = x => x) {
        let v = localStorage.getItem(Parameter.PREFIX + key);
        let f = document.querySelector('.parameters #' + key)
        f.addEventListener('change', evt => this.changed(evt));
        if (v) {
            f.value = v;
        } else {
            v = f.value;
        }
        this.value = conversion(v);
        this.key = key;
        this.conversion = conversion;

    }

    changed(evt) {
        let v = evt.currentTarget.value;
        localStorage.setItem(Parameter.PREFIX + this.key, v);
        this.value = this.conversion(v);
    }
}


class WallColumn {
    constructor(n, width, margin) {
        this.col = n;
        this.width = width;
        this.margin = margin;
        this.elements = [];
        this.ys = [];
        this.x = this.col * width + this.margin * this.col;
    }

    add(ele) {
        this.elements.push(ele);
        this.ys.push(window.innerHeight);
    }

    update(speed) {
        for (let i = 0; i < this.elements.length; i++) {
            let ele = this.elements[i];
            this.ys[i] -= speed;
            ele.style.transform = `translate(${this.x}px,${this.ys[i]}px)`;

            if (this.ys[i] < -ele.offsetHeight - this.margin * 2) {
                this.ys.shift();
                this.elements.shift();
                ele.parentNode.removeChild(ele);
            }

            if (i == this.elements.length - 1) {
                return this.ys[i] < window.innerHeight - ele.offsetHeight - this.margin;
            }
        }

    }
}
window.app = new BaseApp(new WallLayout());
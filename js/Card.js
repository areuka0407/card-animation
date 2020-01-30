class Card {
    static ROW_GAB = 40;
    static COL_GAB = 10;
    constructor(app, data, index){
        this.app = app;

        /* Data Copying */
        this.index = index;

        this.category = data.category;
        this.imageName = data.albumJaketImage;
        this.albumName = data.albumName;
        this.artist = data.artist;
        this.release_date = data.release;
        this.price = parseInt(data.price);

        this.$root = document.createElement("div");
        this.$root.classList.add("card");
        this.$root.draggable = true;
        this.$root.innerHTML = `<div class="image" style="background-image: url(images/${this.imageName})"></div>
                                <div class="info">
                                    <div class="badge">
                                        <span class="number">${this.index + 1}</span>
                                        <span class="price">\\ ${this.price.toLocaleString()}</span>
                                    </div>
                                    <span class="title font-weight-bold">${this.albumName}</span>
                                    <span class="artist mt-1 text-muted">${this.artist}</span>
                                </div>`;

        this.setEvents();
    }

    // 줄여쓰기 위해 사용 (없는 편이 속도는 빠르다)
    get W() { return this.$root.offsetWidth; }
    get H() { return this.$root.offsetHeight; }
    get X() { return this.$root.offsetLeft; }
    get Y() { return this.$root.offsetTop; }
    get alpha() { return parseFloat(window.getComputedStyle(this.$root).getPropertyValue("opacity")) }

    set W(value){ this.$root.style.width = value + "px"; }    
    set X(value){ this.$root.style.left = value + "px"; }    
    set Y(value){ this.$root.style.top = value + "px"; }
    set alpha(value) { this.$root.style.opacity = value; }
    set transition(data) { this.$root.style.transition = data.join(","); }

    setEvents(){
        // 드래그 이벤트
        this.$root.addEventListener("dragstart", e => {
            e.preventDefault();

            
            this.app.dragStart(this);
            this.$root.dataset.x = e.pageX - this.X;
            this.$root.dataset.y = e.pageY - this.Y;
            
        });
    }

    getPosition(index = null){
        let idx = index === null ? this.index : index;

        let row = Math.floor(idx / App.COLUMN);
        let column = idx % App.COLUMN;
        return {
            column: column, 
            row: row
        };
    }
    
    getPixel(data){
        let {column, row} = data;

        const wrap_width = this.app.$list.offsetWidth;
        const height = this.$root.offsetHeight;

        let unitX = (wrap_width + Card.COL_GAB * App.COLUMN) / App.COLUMN;
        
        let X = unitX * column;
        let Y = height * row + Card.ROW_GAB * (row);

        return [X, Y];
    }

    contain(x, y){
        const pos = this.getPosition();
        const [X, Y] = this.getPixel(pos);

        return X <= x && x <= X + this.W && Y <= y && y <= Y + this.H;
    }

    show(){
        const pos = this.getPosition();     // index로 자신의 순서를 계산
        const [X, Y] = this.getPixel(pos);  // X, Y 

        this.Y = Y;
        this.transition = ["opacity 1s", "left 1s"];
        setTimeout(() => {
            this.alpha = 1;
            this.X = X;
        }, 200 * this.column);
    }


}
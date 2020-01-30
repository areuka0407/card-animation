class App {
    static COLUMN = 4;
    static ROW = 9;

    constructor(){
        this.$wrap = document.querySelector("#wrap");
        this.$list = document.querySelector("#list");
        this.$cardLine = document.createElement("div"); // 드래그 시 보여지는 보조라인
        this.$cardLine.classList.add("card-line");

        this.albumList = [];
        this.loadCount = 0;
        this.loadData();
        this.setEvents();
    }

    get cardWidth(){
        return this.$list.offsetWidth / App.COLUMN - (Card.COL_GAB * (App.COLUMN - 1));
    }

    set cardWidth(width){
        this.albumList.forEach(album => album.W = width);
    }

    loadData(){
        const BLOCK = App.COLUMN * App.ROW;
        this.$cardLine.style.width = this.cardWidth + "px";

        let start = BLOCK * this.loadCount++;
        let end = start + BLOCK;

        let newList = data.splice(start, end).map((x, i) => new Card(this, x, i + this.albumList.length)) ;
        if(newList.length === 0) return -1;
        
        newList.forEach(album => {
            this.$list.append(album.$root);
            album.W = this.cardWidth;
            
            const pos = album.getPosition();
            const [X, Y] = album.getPixel(pos);
            album.X = X + 50;
            album.Y = Y;
        });
        this.albumList = this.albumList.concat(newList);
        this.showAlbumInScreen();
    }

    dragStart(album){
        this.dragTarget = album;
        this.dragTarget.transition = [];
        this.dragTarget.$root.style.zIndex = 50;
    }

    dragEnd(){
        if(!this.dragTarget) return;
        this.dragTarget.$root.style.zIndex = 0;
        let pos = this.dragTarget.getPosition();
        let [X, Y] = this.dragTarget.getPixel(pos);
        this.dragTarget.X = X;
        this.dragTarget.Y = Y;
        
        this.dragTarget = null;
        this.$cardLine.remove();
    }

    albumSwap(a, b){
        let temp = this.albumList[a];
        this.albumList[a] = this.albumList[b];
        this.albumList[b] = temp;
    }

    setEvents(){
        // 스크롤 이벤트
        let ticking = false;
        this.$wrap.addEventListener("scroll", e => {
            if(!ticking){                       // 빠른 스크롤 방지
                requestAnimationFrame(() => {
                    const {scrollTop, scrollHeight, offsetHeight} = this.$wrap;
                    this.showAlbumInScreen();
                    ticking = false;

                    if(scrollTop + offsetHeight ===  scrollHeight){
                        this.loadData();
                    }
                });
            }
            ticking = true;
        });

        // 드래그 대상을 움직이는 이벤트
        window.addEventListener("mousemove", e => {
            if(!this.dragTarget || e.which !== 1) return;
            
            

            let x = e.clientX + this.$wrap.scrollLeft - this.$list.offsetLeft;
            let y = e.clientY + this.$wrap.scrollTop - this.$list.offsetTop;

            console.log(x, y);

            this.dragTarget.X = x - parseInt(this.dragTarget.$root.dataset.x);
            this.dragTarget.Y = y - parseInt(this.dragTarget.$root.dataset.y);

            let overlap = this.albumList.find(album => album !== this.dragTarget && album.contain(x, y) && album.alpha == 1);
            if(overlap){
                //보조선 추가
                let pos = overlap.getPosition();
                let [x, y] = overlap.getPixel(pos);

                this.$cardLine.style.left = x + "px";
                this.$cardLine.style.top = y + "px"; 
                if(this.$cardLine.offsetWidth === 0) this.$list.append(this.$cardLine);

                const destination = overlap.index;
                // 드래그 대상보다 목적지가 우측에 있으면
                if( this.dragTarget.index < destination ){
                    for(let i = this.dragTarget.index + 1; i <= destination; i++){
                        let item = this.albumList[i];
                        
                        const pos = item.getPosition(item.index - 1);
                        const [x, y] = item.getPixel(pos);

                        item.transition = ["left 0.5s", "top 0.5s"];
                        item.X = x;
                        item.Y = y;
                        
                        this.albumSwap(item.index, --item.index);
                    }

                }
                // 드래그 대상보다 목적지가 좌측에 있으면
                else {
                    for(let i = this.dragTarget.index - 1; i >= destination; i--){
                        let item = this.albumList[i];
                        
                        const pos = item.getPosition(item.index + 1);
                        const [x, y] = item.getPixel(pos);

                        item.transition = ["left 0.5s", "top 0.5s"];
                        item.X = x;
                        item.Y = y;
                        
                        this.albumSwap(item.index, ++item.index);
                    }
                    
                }
                this.dragTarget.index = destination;
            }
        });

        // 드래그 종료
        window.addEventListener("mouseup", e => this.dragEnd());
    }

    showAlbumInScreen(){
        let startY = this.$wrap.scrollTop;
        let endY = startY + this.$wrap.offsetHeight;
        
        this.albumList.forEach(album => {
            const compare = album.Y + album.H / 2
            if(startY <= compare && compare <= endY && album.alpha !== 1){
                album.show();
            }
        });
    }
}

window.onload = () => {
    const app = new App();
};
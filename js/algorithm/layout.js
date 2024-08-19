
// currentPosX = 100,
export default function Layout(currentPosX = 50, currentPosY = 60, spacingX = 125, spacingY = 150){
    this.currentPosX = currentPosX;
    this.currentPosY = currentPosY;
    this.spacingX = spacingX;
    this.spacingY = spacingY;
};
//使用递归后续遍历
Layout.prototype.init = function (currentPosX = 50, currentPosY = 60, spacingX = 125, spacingY = 150){
    this.currentPosX = currentPosX;
    this.currentPosY = currentPosY;
    this.spacingX = spacingX;
    this.spacingY = spacingY;
};
Layout.prototype.autoSequence = function (roots, posY) {

    let pos = {
        x:this.currentPosX,
        y:posY,
    }

    //递归
    let len = roots.children.length;
    for(let i = 0; i < len; ++i){
        this.autoSequence(roots.children[i], roots.id ? posY+this.spacingY:posY);
    }

    if(roots.id){
        roots.pos = pos;
        let x;
        if(len > 0){
            let first = roots.children[0];
            let last = roots.children[len-1];
            x = (first.pos.x + first.size.width/2.0 + last.pos.x + last.size.width/2.0)/2.0 - roots.size.width/2.0;
        }
        else{
            x = this.currentPosX+(this.spacingX-roots.size.width)/2.0;
            this.currentPosX += this.spacingX;
        }
        roots.pos.x = x;
    }


}
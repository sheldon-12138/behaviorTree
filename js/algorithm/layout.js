
// currentPosX = 100, nextPosX = 50
export default function Layout(nextPosX = 300, currentPosY = 60, spacingX = 25, spacingY = 70) {
    this.nextPosX = nextPosX;
    this.currentPosY = currentPosY;
    this.spacingX = spacingX;
    this.spacingY = spacingY;
};
//使用递归后续遍历
Layout.prototype.init = function (nextPosX = 300, currentPosY = 60, spacingX = 25, spacingY = 70) {
    this.nextPosX = nextPosX;
    this.currentPosY = currentPosY;
    this.spacingX = spacingX;
    this.spacingY = spacingY;
};
Layout.prototype.autoSequence = function (roots, posY, preWidth = 0, onlyOne = false) {

    let pos = {
        x: this.nextPosX,
        y: posY,
    }

    //递归
    let len = roots.children.length;
    for (let i = 0; i < len; ++i) {
        // 这里将 Y 坐标计算改为父节点高度加上 spacingY
        let nextPosY = roots.id ? posY + roots.size.height + this.spacingY : posY;
        this.autoSequence(roots.children[i], nextPosY, roots.size ? roots.size.width : 0, len == 1);
    }

    if (roots.id) {
        roots.pos = pos;
        let x;
        if (len > 0) {
            let first = roots.children[0];
            let last = roots.children[len - 1];
            x = (last.pos.x + last.size.width + first.pos.x - roots.size.width) / 2.0;
        }
        else {
            let d = 0
            if ((preWidth > roots.size.width) && onlyOne) {
                d = (preWidth - roots.size.width) / 2.0
                this.nextPosX += d + d
            }
            x = this.nextPosX - d
            this.nextPosX += roots.size.width + this.spacingX;
            // let flag = (preWidth > roots.size.width) && onlyOne
            // if (flag) {
            //     d = (preWidth - roots.size.width) / 2.0
            //     this.nextPosX += d
            // }
            // x = this.nextPosX
            // this.nextPosX += roots.size.width + (flag ? d : 0) + this.spacingX;
        }
        roots.pos.x = x;
    }
}
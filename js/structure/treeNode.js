export default function TreeNode(id, size, children){
    this.id = id;
    this.size = size;
    this.children = [];
    if(children){
        for(let i = 0; i<children.length; ++i)
            this.children.push(new TreeNode(id));
    }

}
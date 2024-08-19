export default {
  bind(el) {
    const dialogHeaderEl = el.querySelector('.el-dialog__header');
    const dragDom = el.querySelector('.el-dialog');

    dialogHeaderEl.style.cursor = 'move';

    const onMouseMove = (e) => {
      e.preventDefault();
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      dragDom.style.left = `${initialLeft + deltaX}px`;
      dragDom.style.top = `${initialTop + deltaY}px`;
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    let startX, startY, initialLeft, initialTop;

    dialogHeaderEl.onmousedown = (e) => {
      const computedStyle = window.getComputedStyle(dragDom);
      initialLeft = parseFloat(computedStyle.left);
      initialTop = parseFloat(computedStyle.top);
      startX = e.clientX;
      startY = e.clientY;

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    // 添加右侧缩放功能
    const resizeRightEl = document.createElement('div');
    resizeRightEl.style.width = '10px';
    resizeRightEl.style.height = '100%';
    resizeRightEl.style.position = 'absolute';
    resizeRightEl.style.right = '0';
    resizeRightEl.style.top = '0';
    resizeRightEl.style.cursor = 'ew-resize';
    dragDom.appendChild(resizeRightEl);

    const onResizeRightMouseMove = (e) => {
      e.preventDefault();
      const width = Math.max(initialWidth + (e.clientX - startX), 650);
      dragDom.style.width = `${width}px`;
    };

    const onResizeRightMouseUp = () => {
      document.removeEventListener('mousemove', onResizeRightMouseMove);
      document.removeEventListener('mouseup', onResizeRightMouseUp);
    };

    resizeRightEl.onmousedown = (e) => {
      startX = e.clientX;
      initialWidth = dragDom.clientWidth;

      document.addEventListener('mousemove', onResizeRightMouseMove);
      document.addEventListener('mouseup', onResizeRightMouseUp);
    };

    // 添加右下角缩放功能
    const resizeEl = document.createElement('div');
    resizeEl.style.width = '10px';
    resizeEl.style.height = '10px';
    resizeEl.style.position = 'absolute';
    resizeEl.style.right = '0';
    resizeEl.style.bottom = '0';
    resizeEl.style.cursor = 'nwse-resize';
    dragDom.appendChild(resizeEl);

    const onResizeMouseMove = (e) => {
      e.preventDefault();
      const width = Math.max(initialWidth + (e.clientX - startX), 650);
      const height = Math.max(initialHeight + (e.clientY - startY), 200);

      dragDom.style.width = `${width}px`;
      dragDom.style.height = `${height}px`;
      table.style.height = `${height - 50}px`;
    };

    const onResizeMouseUp = () => {
      document.removeEventListener('mousemove', onResizeMouseMove);
      document.removeEventListener('mouseup', onResizeMouseUp);
    };

    let initialWidth, initialHeight, table;

    // const table = el.querySelector('.el-table');
    // const dialogBodyEl = el.querySelector('.el-dialog__body');
    // console.log(dragDom, dialogHeaderEl, table, dialogBodyEl)

    resizeEl.onmousedown = (e) => {
      startX = e.clientX;
      startY = e.clientY;
      initialWidth = dragDom.clientWidth;
      initialHeight = dragDom.clientHeight;
      table = el.querySelector('.el-table')

      document.addEventListener('mousemove', onResizeMouseMove);
      document.addEventListener('mouseup', onResizeMouseUp);
    };
  },
};

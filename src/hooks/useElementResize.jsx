import { useEffect, useState } from 'react';

function useElementResize(ref, options) {
  const {
    defaultOffset,
    defaultSize,
    boundary,
    resizable = true,
    resizeThreshold = 10,
    constraintSize = 200,
  } = options;
  const [offset, setOffset] = useState(defaultOffset);
  const [size, setSize] = useState(defaultSize);
  const cursorPos = useCursor(ref, resizeThreshold, resizable);
  useEffect(() => {
    const target = ref.current;
    if (!target) return;
    const dragTarget = options.dragRef && options.dragRef.current;
    const cover = document.createElement('div');
    cover.style.position = 'fixed';
    cover.style.top = 0;
    cover.style.left = 0;
    cover.style.right = 0;
    cover.style.bottom = 0;
    const previousOffset = { ...offset };
    const previousSize = { ...size };
    let _boundary;
    let originMouseX;
    let originMouseY;
    let shouldCover = false;

    function normalizeEvent(e) {
      if (e.touches && e.touches.length > 0) {
        return { pageX: e.touches[0].pageX, pageY: e.touches[0].pageY };
      }
      if (e.changedTouches && e.changedTouches.length > 0) {
        return { pageX: e.changedTouches[0].pageX, pageY: e.changedTouches[0].pageY };
      }
      return { pageX: e.pageX, pageY: e.pageY };
    }

    function onDragging(e) {
      if (e.cancelable) e.preventDefault();
      if (shouldCover && !document.body.contains(cover)) {
        document.body.appendChild(cover);
      }
      const { pageX, pageY } = getComputedPagePosition(normalizeEvent(e), _boundary);
      const x = pageX - originMouseX + previousOffset.x;
      const y = pageY - originMouseY + previousOffset.y;
      setOffset({ x, y });
    }
    function onDragEnd(e) {
      cover.remove();
      shouldCover = false;
      const { pageX, pageY } = getComputedPagePosition(normalizeEvent(e), _boundary);
      previousOffset.x += pageX - originMouseX;
      previousOffset.y += pageY - originMouseY;
      window.removeEventListener('mousemove', onDragging);
      window.removeEventListener('mouseup', onDragEnd);
      window.removeEventListener('touchmove', onDragging);
      window.removeEventListener('touchend', onDragEnd);
    }
    function onDragStart(e) {
      window.addEventListener('mousemove', onDragging);
      window.addEventListener('mouseup', onDragEnd);
      window.addEventListener('touchmove', onDragging, { passive: false });
      window.addEventListener('touchend', onDragEnd);
    }
    function onDraggingTop(e) {
      if (e.cancelable) e.preventDefault();
      const { pageY } = getComputedPagePosition(normalizeEvent(e), _boundary);
      const { x } = previousOffset;
      const y = pageY - originMouseY + previousOffset.y;
      setOffset({ x, y });
    }
    function onDragEndTop(e) {
      const { pageY } = getComputedPagePosition(normalizeEvent(e), _boundary);
      previousOffset.y += pageY - originMouseY;
      window.removeEventListener('mousemove', onDraggingTop);
      window.removeEventListener('mouseup', onDragEndTop);
      window.removeEventListener('touchmove', onDraggingTop);
      window.removeEventListener('touchend', onDragEndTop);
    }
    function onDragStartTop(e) {
      window.addEventListener('mousemove', onDraggingTop);
      window.addEventListener('mouseup', onDragEndTop);
      window.addEventListener('touchmove', onDraggingTop, { passive: false });
      window.addEventListener('touchend', onDragEndTop);
    }
    function onDraggingLeft(e) {
      if (e.cancelable) e.preventDefault();
      const { pageX } = getComputedPagePosition(normalizeEvent(e), _boundary);
      const x = pageX - originMouseX + previousOffset.x;
      const { y } = previousOffset;
      setOffset({ x, y });
    }
    function onDragEndLeft(e) {
      const { pageX } = getComputedPagePosition(normalizeEvent(e), _boundary);
      previousOffset.x += pageX - originMouseX;
      window.removeEventListener('mousemove', onDraggingLeft);
      window.removeEventListener('mouseup', onDragEndLeft);
      window.removeEventListener('touchmove', onDraggingLeft);
      window.removeEventListener('touchend', onDragEndLeft);
    }
    function onDragStartLeft(e) {
      window.addEventListener('mousemove', onDraggingLeft);
      window.addEventListener('mouseup', onDragEndLeft);
      window.addEventListener('touchmove', onDraggingLeft, { passive: false });
      window.addEventListener('touchend', onDragEndLeft);
    }
    function onResizingRight(e) {
      if (e.cancelable) e.preventDefault();
      const { pageX } = getComputedPagePosition(normalizeEvent(e), _boundary);
      const width = pageX - originMouseX + previousSize.width;
      const { height } = previousSize;
      setSize({ width, height });
    }
    function onResizeEndRight(e) {
      const { pageX } = getComputedPagePosition(normalizeEvent(e), _boundary);
      previousSize.width += pageX - originMouseX;
      window.removeEventListener('mousemove', onResizingRight);
      window.removeEventListener('mouseup', onResizeEndRight);
      window.removeEventListener('touchmove', onResizingRight);
      window.removeEventListener('touchend', onResizeEndRight);
    }
    function onResizeStartRight(e) {
      window.addEventListener('mousemove', onResizingRight);
      window.addEventListener('mouseup', onResizeEndRight);
      window.addEventListener('touchmove', onResizingRight, { passive: false });
      window.addEventListener('touchend', onResizeEndRight);
    }
    function onResizingBottom(e) {
      if (e.cancelable) e.preventDefault();
      const { pageY } = getComputedPagePosition(normalizeEvent(e), _boundary);
      const { width } = previousSize;
      const height = pageY - originMouseY + previousSize.height;
      setSize({ width, height });
    }
    function onResizeEndBottom(e) {
      const { pageY } = getComputedPagePosition(normalizeEvent(e), _boundary);
      previousSize.height += pageY - originMouseY;
      window.removeEventListener('mousemove', onResizingBottom);
      window.removeEventListener('mouseup', onResizeEndBottom);
      window.removeEventListener('touchmove', onResizingBottom);
      window.removeEventListener('touchend', onResizeEndBottom);
    }
    function onResizeStartBottom(e) {
      window.addEventListener('mousemove', onResizingBottom);
      window.addEventListener('mouseup', onResizeEndBottom);
      window.addEventListener('touchmove', onResizingBottom, { passive: false });
      window.addEventListener('touchend', onResizeEndBottom);
    }
    function onResizingLeft(e) {
      if (e.cancelable) e.preventDefault();
      const { pageX } = getComputedPagePosition(normalizeEvent(e), _boundary);
      const width = -pageX + originMouseX + previousSize.width;
      const { height } = previousSize;
      setSize({ width, height });
    }
    function onResizeEndLeft(e) {
      const { pageX } = getComputedPagePosition(normalizeEvent(e), _boundary);
      previousSize.width += -pageX + originMouseX;
      window.removeEventListener('mousemove', onResizingLeft);
      window.removeEventListener('mouseup', onResizeEndLeft);
      window.removeEventListener('touchmove', onResizingLeft);
      window.removeEventListener('touchend', onResizeEndLeft);
    }
    function onResizeStartLeft(e) {
      window.addEventListener('mousemove', onResizingLeft);
      window.addEventListener('mouseup', onResizeEndLeft);
      window.addEventListener('touchmove', onResizingLeft, { passive: false });
      window.addEventListener('touchend', onResizeEndLeft);
    }
    function onResizingTop(e) {
      if (e.cancelable) e.preventDefault();
      const { pageY } = getComputedPagePosition(normalizeEvent(e), _boundary);
      const height = -pageY + originMouseY + previousSize.height;
      const { width } = previousSize;
      setSize({ width, height });
    }
    function onResizeEndTop(e) {
      const { pageY } = getComputedPagePosition(normalizeEvent(e), _boundary);
      previousSize.height += -pageY + originMouseY;
      window.removeEventListener('mousemove', onResizingTop);
      window.removeEventListener('mouseup', onResizeEndTop);
      window.removeEventListener('touchmove', onResizingTop);
      window.removeEventListener('touchend', onResizeEndTop);
    }
    function onResizeStartTop(e) {
      window.addEventListener('mousemove', onResizingTop);
      window.addEventListener('mouseup', onResizeEndTop);
      window.addEventListener('touchmove', onResizingTop, { passive: false });
      window.addEventListener('touchend', onResizeEndTop);
    }
    function onResizingTopLeft(e) {
      if (e.cancelable) e.preventDefault();
      const { pageX, pageY } = getComputedPagePosition(normalizeEvent(e), _boundary);
      const width = -pageX + originMouseX + previousSize.width;
      const height = -pageY + originMouseY + previousSize.height;
      setSize({ width, height });
    }
    function onResizeEndTopLeft(e) {
      const { pageX, pageY } = getComputedPagePosition(normalizeEvent(e), _boundary);
      previousSize.width += -pageX + originMouseX;
      previousSize.height += -pageY + originMouseY;
      window.removeEventListener('mousemove', onResizingTopLeft);
      window.removeEventListener('mouseup', onResizeEndTopLeft);
      window.removeEventListener('touchmove', onResizingTopLeft);
      window.removeEventListener('touchend', onResizeEndTopLeft);
    }
    function onResizeStartTopLeft(e) {
      window.addEventListener('mousemove', onResizingTopLeft);
      window.addEventListener('mouseup', onResizeEndTopLeft);
      window.addEventListener('touchmove', onResizingTopLeft, { passive: false });
      window.addEventListener('touchend', onResizeEndTopLeft);
    }
    function onResizingTopRight(e) {
      if (e.cancelable) e.preventDefault();
      const { pageX, pageY } = getComputedPagePosition(normalizeEvent(e), _boundary);
      const width = pageX - originMouseX + previousSize.width;
      const height = -pageY + originMouseY + previousSize.height;
      setSize({ width, height });
    }
    function onResizeEndTopRight(e) {
      const { pageX, pageY } = getComputedPagePosition(normalizeEvent(e), _boundary);
      previousSize.width += pageX - originMouseX;
      previousSize.height += -pageY + originMouseY;
      window.removeEventListener('mousemove', onResizingTopRight);
      window.removeEventListener('mouseup', onResizeEndTopRight);
      window.removeEventListener('touchmove', onResizingTopRight);
      window.removeEventListener('touchend', onResizeEndTopRight);
    }
    function onResizeStartTopRight(e) {
      window.addEventListener('mousemove', onResizingTopRight);
      window.addEventListener('mouseup', onResizeEndTopRight);
      window.addEventListener('touchmove', onResizingTopRight, { passive: false });
      window.addEventListener('touchend', onResizeEndTopRight);
    }
    function onResizingBottomLeft(e) {
      if (e.cancelable) e.preventDefault();
      const { pageX, pageY } = getComputedPagePosition(normalizeEvent(e), _boundary);
      const width = -pageX + originMouseX + previousSize.width;
      const height = pageY - originMouseY + previousSize.height;
      setSize({ width, height });
    }
    function onResizeEndBottomLeft(e) {
      const { pageX, pageY } = getComputedPagePosition(normalizeEvent(e), _boundary);
      previousSize.width += -pageX + originMouseX;
      previousSize.height += pageY - originMouseY;
      window.removeEventListener('mousemove', onResizingBottomLeft);
      window.removeEventListener('mouseup', onResizeEndBottomLeft);
      window.removeEventListener('touchmove', onResizingBottomLeft);
      window.removeEventListener('touchend', onResizeEndBottomLeft);
    }
    function onResizeStartBottomLeft(e) {
      window.addEventListener('mousemove', onResizingBottomLeft);
      window.addEventListener('mouseup', onResizeEndBottomLeft);
      window.addEventListener('touchmove', onResizingBottomLeft, { passive: false });
      window.addEventListener('touchend', onResizeEndBottomLeft);
    }
    function onResizingBottomRight(e) {
      if (e.cancelable) e.preventDefault();
      const { pageX, pageY } = getComputedPagePosition(normalizeEvent(e), _boundary);
      const width = pageX - originMouseX + previousSize.width;
      const height = pageY - originMouseY + previousSize.height;
      setSize({ width, height });
    }
    function onResizeEndBottomRight(e) {
      const { pageX, pageY } = getComputedPagePosition(normalizeEvent(e), _boundary);
      previousSize.width += pageX - originMouseX;
      previousSize.height += pageY - originMouseY;
      window.removeEventListener('mousemove', onResizingBottomRight);
      window.removeEventListener('mouseup', onResizeEndBottomRight);
      window.removeEventListener('touchmove', onResizingBottomRight);
      window.removeEventListener('touchend', onResizeEndBottomRight);
    }
    function onResizeStartBottomRight(e) {
      window.addEventListener('mousemove', onResizingBottomRight);
      window.addEventListener('mouseup', onResizeEndBottomRight);
      window.addEventListener('touchmove', onResizingBottomRight, { passive: false });
      window.addEventListener('touchend', onResizeEndBottomRight);
    }
    function getTouchResizePos(touch) {
      const rect = target.getBoundingClientRect();
      const offsetX = touch.clientX - rect.left;
      const offsetY = touch.clientY - rect.top;
      const { width, height } = rect;
      const t = resizeThreshold * 10;
      if (offsetX < t) {
        if (offsetY < t) return 'topLeft';
        if (height - offsetY < t) return 'bottomLeft';
        return 'left';
      }
      if (offsetY < t) {
        if (width - offsetX < t) return 'topRight';
        return 'top';
      }
      if (width - offsetX < t) {
        if (height - offsetY < t) return 'bottomRight';
        return 'right';
      }
      if (height - offsetY < t) return 'bottom';
      return '';
    }
    function onMouseDown(e) {
      const { pageX, pageY } = normalizeEvent(e);
      originMouseX = pageX;
      originMouseY = pageY;
      _boundary = { ...boundary };
      if (dragTarget && e.target === dragTarget) {
        shouldCover = true;
        return onDragStart(e);
      }
      if (e.target !== target || !resizable) return;
      const activePos = (e.touches && e.touches.length > 0)
        ? getTouchResizePos(e.touches[0])
        : cursorPos;
      switch (activePos) {
        case 'topLeft':
          _boundary.right = originMouseX + previousSize.width - constraintSize;
          _boundary.bottom =
            originMouseY + previousSize.height - constraintSize;
          onResizeStartTopLeft(e);
          onDragStart(e);
          break;
        case 'left':
          _boundary.right = originMouseX + previousSize.width - constraintSize;
          onResizeStartLeft(e);
          onDragStartLeft(e);
          break;
        case 'bottomLeft':
          _boundary.right = originMouseX + previousSize.width - constraintSize;
          _boundary.top = originMouseY - previousSize.height + constraintSize;
          onResizeStartBottomLeft(e);
          onDragStartLeft(e);
          break;
        case 'top':
          _boundary.bottom =
            originMouseY + previousSize.height - constraintSize;
          onResizeStartTop(e);
          onDragStartTop(e);
          break;
        case 'topRight':
          _boundary.bottom =
            originMouseY + previousSize.height - constraintSize;
          _boundary.left = originMouseX - previousSize.width + constraintSize;
          onDragStartTop(e);
          onResizeStartTopRight(e);
          break;
        case 'right':
          _boundary.left = originMouseX - previousSize.width + constraintSize;
          onResizeStartRight(e);
          break;
        case 'bottomRight':
          _boundary.top = originMouseY - previousSize.height + constraintSize;
          _boundary.left = originMouseX - previousSize.width + constraintSize;
          onResizeStartBottomRight(e);
          break;
        case 'bottom':
          _boundary.top = originMouseY - previousSize.height + constraintSize;
          onResizeStartBottom(e);
          break;
        default:
      }
    }
    target.addEventListener('mousedown', onMouseDown);
    target.addEventListener('touchstart', onMouseDown, { passive: false });
    return () => {
      target.removeEventListener('mousedown', onMouseDown);
      target.removeEventListener('touchstart', onMouseDown);
      window.removeEventListener('mousemove', onDraggingLeft);
      window.removeEventListener('mousemove', onDraggingTop);
      window.removeEventListener('mousemove', onDragging);
      window.removeEventListener('mouseup', onDragEndTop);
      window.removeEventListener('mouseup', onDragEndLeft);
      window.removeEventListener('mouseup', onDragEnd);
      window.removeEventListener('mousemove', onResizingTop);
      window.removeEventListener('mousemove', onResizingRight);
      window.removeEventListener('mousemove', onResizingBottom);
      window.removeEventListener('mousemove', onResizingLeft);
      window.removeEventListener('mousemove', onResizingBottomLeft);
      window.removeEventListener('mousemove', onResizingTopLeft);
      window.removeEventListener('mousemove', onResizingTopRight);
      window.removeEventListener('mousemove', onResizingBottomRight);
      window.removeEventListener('mouseup', onResizeEndTop);
      window.removeEventListener('mouseup', onResizeEndRight);
      window.removeEventListener('mouseup', onResizeEndBottom);
      window.removeEventListener('mouseup', onResizeEndLeft);
      window.removeEventListener('mouseup', onResizeEndBottomLeft);
      window.removeEventListener('mouseup', onResizeEndTopLeft);
      window.removeEventListener('mouseup', onResizeEndTopRight);
      window.removeEventListener('mouseup', onResizeEndBottomRight);
      window.removeEventListener('touchmove', onDraggingLeft);
      window.removeEventListener('touchmove', onDraggingTop);
      window.removeEventListener('touchmove', onDragging);
      window.removeEventListener('touchend', onDragEndTop);
      window.removeEventListener('touchend', onDragEndLeft);
      window.removeEventListener('touchend', onDragEnd);
      window.removeEventListener('touchmove', onResizingTop);
      window.removeEventListener('touchmove', onResizingRight);
      window.removeEventListener('touchmove', onResizingBottom);
      window.removeEventListener('touchmove', onResizingLeft);
      window.removeEventListener('touchmove', onResizingBottomLeft);
      window.removeEventListener('touchmove', onResizingTopLeft);
      window.removeEventListener('touchmove', onResizingTopRight);
      window.removeEventListener('touchmove', onResizingBottomRight);
      window.removeEventListener('touchend', onResizeEndTop);
      window.removeEventListener('touchend', onResizeEndRight);
      window.removeEventListener('touchend', onResizeEndBottom);
      window.removeEventListener('touchend', onResizeEndLeft);
      window.removeEventListener('touchend', onResizeEndBottomLeft);
      window.removeEventListener('touchend', onResizeEndTopLeft);
      window.removeEventListener('touchend', onResizeEndTopRight);
      window.removeEventListener('touchend', onResizeEndBottomRight);
      cover.remove();
    };
    // eslint-disable-next-line
  }, [boundary.top, boundary.right, boundary.bottom, boundary.left, cursorPos]);
  return { offset, size };
}
function useCursor(ref, threshold, resizable) {
  const [position, setPosition] = useState('');
  useEffect(() => {
    const target = ref.current;
    if (!target || !resizable) return;
    const cover = document.createElement('div');
    cover.style.position = 'fixed';
    cover.style.top = 0;
    cover.style.left = 0;
    cover.style.right = 0;
    cover.style.bottom = 0;
    let lock = false;
    function _setPosition(p) {
      setPosition(p);
      target.style.cursor = getCursorStyle(p);
      cover.style.cursor = getCursorStyle(p);
    }
    function onMouseDown(e) {
      if (e.target !== target) return;
      onHover(e);
      lock = true;
      document.body.appendChild(cover);
      window.addEventListener('mouseup', onMouseUp);
    }
    function onMouseUp(e) {
      lock = false;
      cover.remove();
      window.removeEventListener('mouseup', onMouseUp);
    }
    function onHoverEnd(e) {
      if (lock) return;
      _setPosition('');
    }
    function onHover(e) {
      if (lock) return;
      if (e.target !== target) return _setPosition('');
      const { offsetX, offsetY } = e;
      const { width, height } = target.getBoundingClientRect();
      if (offsetX < threshold) {
        if (offsetY < threshold) {
          _setPosition('topLeft');
        } else if (height - offsetY < threshold) {
          _setPosition('bottomLeft');
        } else {
          _setPosition('left');
        }
      } else if (offsetY < threshold) {
        if (width - offsetX < threshold) {
          _setPosition('topRight');
        } else {
          _setPosition('top');
        }
      } else if (width - offsetX < threshold) {
        if (height - offsetY < threshold) _setPosition('bottomRight');
        else _setPosition('right');
      } else if (height - offsetY < threshold) {
        _setPosition('bottom');
      } else {
        _setPosition('');
      }
    }
    target.addEventListener('mouseleave', onHoverEnd);
    target.addEventListener('mousemove', onHover);
    target.addEventListener('mousedown', onMouseDown);
    return () => {
      cover.remove();
      target.removeEventListener('mouseleave', onHoverEnd);
      target.removeEventListener('mousemove', onHover);
      target.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
    };
    // eslint-disable-next-line
  }, []);
  return position;
}

function getComputedPagePosition({ pageX, pageY }, boundary) {
  if (!boundary) return { pageX, pageY };
  const { top, right, bottom, left } = boundary;
  if (pageX <= left) pageX = left;
  else if (pageX >= right) pageX = right;
  if (pageY <= top) pageY = top;
  else if (pageY >= bottom) pageY = bottom;
  return { pageX, pageY };
}
function getCursorStyle(pos) {
  switch (pos) {
    case 'top':
      return 'n-resize';
    case 'topRight':
      return 'ne-resize';
    case 'right':
      return 'e-resize';
    case 'bottomRight':
      return 'se-resize';
    case 'bottom':
      return 's-resize';
    case 'bottomLeft':
      return 'sw-resize';
    case 'left':
      return 'w-resize';
    case 'topLeft':
      return 'nw-resize';
    default:
      return 'auto';
  }
}
export default useElementResize;

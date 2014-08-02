/*global nkchgApply */
/*jslint browser: true, devel: true, indent: 2 */
var nkchgWall = document.getElementById('feed_rows'),
  nkchgObserver;

if (!nkchgObserver) {
  var nkchgObserver = new window.MutationObserver(function (mutations) {
    'use strict';
    if (mutations[0].addedNodes.length !== 0) {
      nkchgApply();
      console.log('Чистые новости для VK.com: your wall has been cleaned by the MutationObserver');
    }
  });
}

nkchgObserver.observe(nkchgWall, {childList: true});

function nkchgClosestEl(elem, action, nkchgClass) {
  'use strict';
  var parent = elem.parentNode,
    re = new RegExp(nkchgClass, 'g');
  while (parent !== nkchgWall) {
    if (parent.className.indexOf('feed_row') !== -1) {
      if (action === 'checked') {
        if (parent.className.indexOf(nkchgClass) === -1) {
          parent.className += nkchgClass;
        }
        return;
      }
      parent.className = parent.className.replace(re, '');
      return;
    }
    parent = parent.parentNode;
  }
}

function nkchgFind(className, action, newClassName) {
  'use strict';
  var els = nkchgWall.getElementsByClassName(className),
    l = els.length,
    i,
    el;
  for (i = 0; i < l; i += 1) {
    el = els[i];
    if (!(newClassName === 'nkchgApps' && el.href.indexOf('app3698024') !== -1)) {
      nkchgClosestEl(el, action, ' ' + newClassName);
    }
  }
}

/*jslint browser: true, devel: true, indent: 2 */

var CFFVK;

CFFVK = CFFVK || (function () {
  'use strict';

  return {
    processFeedItem: function processFeedItem(elem, action, className) {
      var parent = elem.parentNode,
        re = new RegExp(className, 'g');
      while (parent !== CFFVK.feed) {
        if (parent.className.indexOf('feed_row') !== -1) {
          if (action === 'checked') {
            if (parent.className.indexOf(className) === -1) {
              parent.className += className;
            }
            return;
          }
          parent.className = parent.className.replace(re, '');
          return;
        }
        parent = parent.parentNode;
      }
    },

    find: function find(className, action, newClassName) {
      var els = CFFVK.feed.getElementsByClassName(className),
        l = els.length,
        i,
        el;
      for (i = 0; i < l; i += 1) {
        el = els[i];
        if (!(newClassName === 'cffvk-apps' && el.href.indexOf('app3698024') !== -1)) {
          CFFVK.processFeedItem(el, action, ' ' + newClassName);
        }
      }
    },

    observer: new window.MutationObserver(function (mutations) {
      if (mutations[0].addedNodes.length !== 0) {
        CFFVK.clean();
        console.log('Clean Feed for VK.com: your feed has been cleaned by the MutationObserver');
      }
    })
  };
}());

CFFVK.feed = document.getElementById('feed_rows');

CFFVK.observer.observe(CFFVK.feed, {childList: true});

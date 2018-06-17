function hasClass(elem, className) {
  return new RegExp(' ' + className + ' ').test(' ' + elem.className + ' ');
}

function toggleClass(elem, className) {
  var newClass = ' ' + elem.className.replace(/[\t\r\n]/g, ' ') + ' ';
  if (hasClass(elem, className)) {
    while (newClass.indexOf(' ' + className + ' ') >= 0 ) {
      newClass = newClass.replace(' ' + className + ' ', ' ');
    }
    elem.className = newClass.replace(/^\s+|\s+$/g, '');
  } else {
    elem.className += ' ' + className;
  }
}

$('#sidebar-toggler').click(function() {
  $('#sidebar').slideToggle();
  let icon = $('#sidebar-toggler-icon')[0];
  toggleClass(icon, 'fa-angle-down');
  toggleClass(icon, 'fa-angle-up');
});

var x = window.matchMedia("(min-width: 768px)")
function showSidebar(x) {
  if (x.matches) {
    document.querySelector('#sidebar').style.removeProperty('display');
  }
}
x.addListener(showSidebar)

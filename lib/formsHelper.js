export function isOptionSelected(dropdownSelector, option) {
  var selectBox = document.querySelector(dropdownSelector);
  var isSelected = false;

  if (selectBox && selectBox.selectedIndex === option) {
    isSelected = true;
  }

  return isSelected;
}

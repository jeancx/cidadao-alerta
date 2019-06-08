const AlertType = 'info' | 'warn' | 'error' | 'success'

export class DropDownHolder {
  static setDropDown (dropDown) {
    this.dropDown = dropDown
  }

  static alert (type, title, message) {
    this.dropDown.alertWithType(type, title, message)
  }
}

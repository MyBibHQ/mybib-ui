
class SnackBar {
  activeSnack = {};
  activeSnackTimeout;

  addSnack (snack) {
    this.activeSnack = snack;
    clearTimeout(this.activeSnackTimeout);
    this.activeSnackTimeout = setTimeout(() => {
      this.removeActiveSnack();
    }, 8000)
  }

  removeActiveSnack () {
    this.activeSnack = {};
  }
}

const singleton = new SnackBar();
export default singleton;

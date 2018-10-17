function initForm () {
  var exceptedInputs = ['hidden', 'date', 'file']
  var forms = Array.prototype.slice.call(document.getElementsByTagName('form'))
  Array.prototype.slice.call(forms).forEach(function (form) {
    var inputs = Array.prototype.slice.call(form.getElementsByTagName('input'))

    inputs.forEach(function (input) {
      if (exceptedInputs.indexOf(input.type) === -1) {
        if (input.value !== '') {
          input.parentNode.classList.add('form--input-focused')
        }

        input.addEventListener('focusin', inputFocusIn)
        input.addEventListener('focusout', inputFocusOut)
        input.addEventListener('change', inputFocusIn)
        input.addEventListener('change', inputFocusOut)
      }
    })
  })
}

function inputFocusIn (e) {
  if (!this.parentNode.classList.contains('form--input-focused')) {
    this.parentNode.classList.add('form--input-focused')
  }
}

function inputFocusOut (e) {
  if (this.value === '' && this.parentNode.classList.contains('form--input-focused')) {
    this.parentNode.classList.remove('form--input-focused')
  }
}
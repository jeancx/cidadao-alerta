function limitText (text, size) {
  const breakLine = /(\r\n|\n|\r)/gm

  if (!text) return ''

  if (text.length > size) {
    return `${text.replace(breakLine, '').substr(0, size)}...`
  } else {
    return text.replace(breakLine, ' ').substr(0, text.length)
  }
}

function buildAddressString (address) {
  if (!address) return ''

  return (address.street ? address.street + ', ' : '') +
    (address.name && address.name !== address.street ? address.name + ', ' : '') +
    (address.city ? address.city + ', ' : ('')) +
    (address.region ? address.region : '')
}

export default { limitText, buildAddressString }

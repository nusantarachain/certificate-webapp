function formatDate(d) {
  let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d)
  let mo = new Intl.DateTimeFormat('id', { month: 'long' }).format(d)
  let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d)
  return `${da} ${mo} ${ye}`
}

function getPropValue(props, key){
  let rv = props.find((a) => a.name == key);
  if (rv){
    return rv.value
  }
  return rv
}

function validIssuedId(id){
  return (id.length == 11 && /^[a-zA-Z0-9]+$/.test(id));
}

export default async ({ app }, inject) => {
  inject('util', { formatDate, getPropValue, validIssuedId })
}

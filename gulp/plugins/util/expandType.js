const _ = require('lodash')
const { names } = require('../../../src/elements/Flag/Flag') // eslint-disable-line no-unused-vars
const { positions } = require('../../../src/modules/Popup/lib/positions') // eslint-disable-line no-unused-vars
const SUI = require('../../../src/lib/SUI') // eslint-disable-line no-unused-vars

const evalValue = (value) => eval(value) // eslint-disable-line no-eval

const isTransformable = (value) =>
  typeof value === 'string' &&
  (value.includes('SUI') || value.includes('names') || value.includes('positions'))

const uniqValues = (values) => _.uniqWith(values, (val, other) => `${val}` === `${other}`)

const transformEnumValues = (values) =>
  _.flatMap(values, ({ value }) => {
    if (value === 'names') return evalValue(value) // BMW evals flag "names"
    if (_.startsWith(value, '...SUI')) return evalValue(value.substring(3))
    return value.replace(/'/g, '')
  })

const parseEnum = (type) => {
  const { value } = type

  // BMW evals SUI.something, "names" for flag names, and "positions" for popup positions
  const values = isTransformable(value)
    ? uniqValues(evalValue(value))
    : uniqValues(transformEnumValues(value))

  // Replace previous value array with new one based on processed enum values
  return {
    ...type,
    value: _.map(values, (v) => {
      return {
        value: v,
        computed: false,
      }
    }),
  }
}

// const parseUnion = (union) => {
//   const { value } = union
//   const values = _.flatten(
//     _.map(_.filter(value, { name: 'enum' }), (type) => parseEnum(type).value),
//   )

//   return {
//     ...union,
//     name: _.map(value, 'name').join('|'),
//     value: values,
//   }
// }

const parsers = {
  enum: parseEnum,
  // TODO restore
  // union: parseUnion,
}

export default (propName, { type }) => {
  if (type === undefined) {
    throw new Error(
      [
        `The prop "${propName}" does not contain propType definition. This happens if the property is in the `,
        'defaultProps, but it is not in the propTypes',
      ].join(' '),
    )
  }

  const parser = parsers[type.name]

  return parser ? parser(type) : type
}

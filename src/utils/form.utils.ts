import {get, set} from "lodash"
import * as yup from "yup"

/**
 * It is desirable to visually mark a field as required by displaying an asterisk
 * react-hook-form doesn't have a way of doing this so we must pass down the validationSchema
 * and inspect it to determine if the field is required, this helper achieves that
 *
 */
export const isRequiredField = (validationSchema: any, name: string) => {
  if (!validationSchema) {
    return false
  }
  const schemaDescription = validationSchema.describe()
  const accessor = name.split(".").join(".fields.")
  const field = get(schemaDescription.fields, accessor)
  if (!field) {
    return false
  }
  const isRequired = field.tests.some((test) => test.name === "required")
  return isRequired
}

/**
 * In react-hook-form inputs can not be null or undefined. This function evaluates all properties
 * and if it finds any properties that are null or undefined it sets them to the default value
 *
 * @param obj the object to provide fallbacks to
 * @param defaultValues the default values
 * @returns
 */
export function withDefaultValuesFallback(obj: any, defaultValues: any): any {
  Object.keys(defaultValues).forEach((key) => {
    const value = get(obj, key, null)
    if (value == null) {
      set(obj, key, defaultValues[key])
    } else if (Array.isArray(value) && Array.isArray(defaultValues[key]) && defaultValues[key].length) {
      // If the value is an array we need to check the value for each item in the array
      // fallback will be the first item in the defaultValues array item
      value.forEach((innerObj, index) => {
        Object.keys(innerObj).forEach((innerKey) => {
          const innerObjValue = innerObj[innerKey]
          if (innerObjValue == null) {
            set(obj, `${key}.${index}.${innerKey}`, defaultValues[key][0][innerKey])
          }
        })
      })
    }
  })
  return obj
}

/**
 * Takes a flat object definition such as:
 * const obj = {
 *   'Product.Active': true,
 *   'Product.Description': ''
 * }
 *
 * and turns it to a nested one:
 * const obj = {
 *  Product: {
 *     Active: true
 *     Description: ''
 *   }
 * }
 */
export function makeNestedObject(obj: any) {
  const newObj = {}
  Object.keys(obj).forEach((key) => {
    set(newObj, key, obj[key])
  })
  return newObj
}

/**
 * Helper that makes form validation valid by ensuring it is nested
 * this is useful because we can format both initial values and validation in the same way
 *
 * Takes a flat form validation definition such as:
 * const schema = {
 *   'Product.Active': yup.string(),
 *   'Product.Inventory.Enabled': yup.bool()
 * }
 *
 * and turns it to a nested one:
 * const schema = {
 *  Product: yup.object({
 *     Active: yup.string(),
 *     Inventory: yup.object({
 *      Enabled: yup.bool()
 *    })
 *  })
 * }
 */
export function makeNestedValidationSchema(obj: any) {
  return wrapSchema(makeNestedObject(obj))
}

function wrapSchema(obj: any) {
  Object.keys(obj).forEach((key) => {
    const value = obj[key]
    const isSchema = value instanceof yup.BaseSchema
    if (!isSchema) {
      const wrapped = wrapSchema(value)
      obj[key] = yup.object(wrapped)
    }
  })
  return obj
}

/**
 * Yup helper for allowing number types with a default value of empty string
 * Chakra doesn't allow null for inputs, and undefined is considered uncontrolled input
 * and we may not want to default a field to zero so this lets us define an "empty" field
 * without yup validation yelling at us when it hasn't been filled in and luckily
 * OrderCloud simply ignores empty strings
 */
export function emptyStringToNull(value, originalValue) {
  if (typeof originalValue === "string" && originalValue === "") {
    return null
  }
  return value
}

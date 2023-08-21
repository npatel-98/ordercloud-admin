import {xpHelper} from "utils"
import {object} from "yup"
import {ObjectShape} from "yup/lib/object"
import {useErrorToast, useSuccessToast} from "./useToast"

/**
 * This hook aims to reduce boilerplate by providing functionality common
 * to a CreateUpdateForm component. Using this hook is not strictly required
 *
 * @param resource the resource to add or edit
 * @param objectShape the shape of object defined with Yup helpers, used for form validation rules
 * @param onCreate the function to handle a create operation
 * @param onUpdate the function to handle an update operation
 */
export const useCreateUpdateForm = <ResourceType extends object>(
  resource: ResourceType,
  objectShape: ObjectShape,
  onCreate?: (resource: ResourceType) => void,
  onUpdate?: (resource: ResourceType) => void
) => {
  const isCreating = !resource // if no resource is defined, we assume we are adding a new resource
  const successToast = useSuccessToast()
  const errorToast = useErrorToast()
  const validationSchema = object().shape(objectShape)
  const defaultValues = isCreating ? {} : xpHelper.flattenXpObject(resource, "_")

  const onSubmit = async (fields) => {
    const resourceToUpdate = xpHelper.unflattenXpObject(fields, "_") as ResourceType
    if (isCreating) {
      await onCreate(resourceToUpdate)
    } else {
      await onUpdate(resourceToUpdate)
    }
  }

  return {isCreating, successToast, errorToast, validationSchema, defaultValues, onSubmit}
}

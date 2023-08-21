import {Control, FieldValues, useFieldArray, useWatch} from "react-hook-form"
import {Card, CardBody, Heading, CardHeader, Text, Flex} from "@chakra-ui/react"
import {CategoryTable} from "./CategoryTable"
import {ICategoryProductAssignment} from "types/ordercloud/ICategoryProductAssignment"
import {CategorySelect} from "./CategorySelect"

interface CategoryFormProps {
  control: Control<FieldValues, any>
}
export function CategoryForm({control}: CategoryFormProps) {
  const fieldArray = useFieldArray({
    control,
    name: `CategoryAssignments`
  })

  const existingAssignments = useWatch({control, name: `CategoryAssignments`})

  const categoryAssignments = fieldArray.fields as any as ICategoryProductAssignment[]

  const handleCategoryAdd = (newCategorySelections: ICategoryProductAssignment[]) => {
    fieldArray.append(newCategorySelections)
  }

  return (
    <Card mt={6}>
      <CardHeader display="flex" alignItems={"center"} justifyContent="space-between">
        <Heading as="h3" fontSize="lg" alignSelf={"flex-start"}>
          Categories
          <Text fontSize="sm" color="gray.400" fontWeight="normal" marginTop={2}>
            Define which categories this product is assigned to
          </Text>
        </Heading>
        <CategorySelect onUpdate={handleCategoryAdd} existingAssignments={existingAssignments} />
      </CardHeader>
      <CardBody>
        {categoryAssignments.length > 0 ? (
          <CategoryTable fieldArray={fieldArray} control={control} />
        ) : (
          <Flex justifyContent="center">
            <Text color="gray.400" fontSize="small">
              This product is not assigned to any categories
            </Text>
          </Flex>
        )}
      </CardBody>
    </Card>
  )
}

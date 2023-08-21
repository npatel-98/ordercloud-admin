import React from "react"
import {Control, FieldValues, useController} from "react-hook-form"
import {Box, Card, CardBody, CardHeader, Heading, Icon, Text, VStack} from "@chakra-ui/react"
import {IProductFacet} from "types/ordercloud/IProductFacet"
import {TbCactus, TbX} from "react-icons/tb"
import {cloneDeep, difference} from "lodash"
import {FacetUpdateModal} from "./FacetUpdateModal"
import {SelectControl} from "@/components/react-hook-form"

interface FacetFormProps {
  control: Control<FieldValues, any>
  facetList: IProductFacet[]
}

export function FacetsForm({control, facetList}: FacetFormProps) {
  const {field} = useController({control, name: "Product.xp.Facets"})
  const productFacetIds = Object.keys(field.value || {})
    .filter((key) => field.value[key]) // exclude facets with empty values
    .filter((key) => facetList.find((f) => f.ID === key)) // exclude xp facets that are not in the facet list

  const handleFacetsUpdate = (selectedFacetIds: string[]) => {
    const addKeys = difference(selectedFacetIds, productFacetIds)
    const removeKeys = difference(productFacetIds, selectedFacetIds)
    const clone = cloneDeep(field.value)
    addKeys.forEach((key) => {
      clone[key] = []
    })
    removeKeys.forEach((key) => {
      clone[key] = null
    })
    field.onChange(clone)
  }

  if (!productFacetIds.length) {
    return (
      <Box p={6} display="flex" flexDirection={"column"} alignItems={"center"} justifyContent={"center"} minH={"xs"}>
        <Icon as={TbCactus} fontSize={"5xl"} strokeWidth={"2px"} color="accent.500" />
        <Heading colorScheme="secondary" fontSize="xl">
          <VStack>
            <Text>This product has no facets</Text>
            <FacetUpdateModal
              facetIds={productFacetIds}
              availableFacets={facetList}
              onUpdate={handleFacetsUpdate}
              buttonProps={{
                variant: "solid",
                size: "sm",
                colorScheme: "primary"
              }}
            />
          </VStack>
        </Heading>
      </Box>
    )
  }
  return (
    <Card>
      <CardHeader display="flex" alignItems={"center"}>
        <Heading as="h3" fontSize="lg" alignSelf={"flex-start"}>
          Facets
          <Text fontSize="sm" color="gray.400" fontWeight="normal" marginTop={2}>
            Define which facets are available for this product
          </Text>
        </Heading>
        <FacetUpdateModal
          facetIds={productFacetIds}
          availableFacets={facetList}
          onUpdate={handleFacetsUpdate}
          buttonProps={{
            variant: "outline",
            colorScheme: "accent",
            ml: "auto"
          }}
        />
      </CardHeader>
      <CardBody>
        <VStack gap={3} align="start" maxWidth="md">
          {productFacetIds.map((facetId) => {
            const facet = facetList.find((f) => f.ID === facetId)
            const facetOptions = (facet.xp?.Options || []).map((option) => ({label: option, value: option}))
            return (
              <SelectControl
                key={facetId}
                name={`Product.xp.Facets.${facetId}`}
                control={control}
                selectProps={{options: facetOptions, isMulti: true}}
              />
            )
          })}
        </VStack>
      </CardBody>
    </Card>
  )
}

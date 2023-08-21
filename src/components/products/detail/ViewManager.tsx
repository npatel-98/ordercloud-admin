import {ChevronDownIcon} from "@chakra-ui/icons"
import {
  HStack,
  SimpleGrid,
  Checkbox,
  Text,
  Popover,
  PopoverTrigger,
  Button,
  PopoverContent,
  PopoverHeader,
  PopoverArrow,
  PopoverCloseButton,
  PopoverBody,
  PopoverFooter,
  Flex
} from "@chakra-ui/react"
import {ChangeEvent, useState} from "react"
import {ProductDetailTab} from "./ProductDetail"

interface ViewManagerProps {
  viewVisibility: Record<ProductDetailTab, boolean>
  setViewVisibility: (update: Record<ProductDetailTab, boolean>) => void
}

export default function ViewManager({viewVisibility, setViewVisibility}: ViewManagerProps) {
  const [visibility, setVisibility] = useState(viewVisibility)
  const onSubmit = (onClose: () => void) => {
    setViewVisibility(visibility)
    onClose()
  }
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const update = {...visibility, [event.target.value]: event.target.checked}
    setVisibility(update)
  }
  return (
    <Popover>
      {({onClose}) => (
        <>
          <PopoverTrigger>
            <Button variant="outline">
              <HStack>
                <Text>Views </Text>
                <ChevronDownIcon />
              </HStack>
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverBody>
              <SimpleGrid columns={[1, 2]} spacing={2}>
                <Checkbox value="Details" isChecked={visibility.Details} onChange={handleChange}>
                  Details
                </Checkbox>
                <Checkbox value="Pricing" isChecked={visibility.Pricing} onChange={handleChange}>
                  Pricing
                </Checkbox>
                <Checkbox value="Catalogs" isChecked={visibility.Catalogs} onChange={handleChange}>
                  Catalogs
                </Checkbox>
                <Checkbox value="Variants" isChecked={visibility.Variants} onChange={handleChange}>
                  Variants
                </Checkbox>
                <Checkbox value="Media" isChecked={visibility.Media} onChange={handleChange}>
                  Media
                </Checkbox>
                <Checkbox value="Facets" isChecked={visibility.Facets} onChange={handleChange}>
                  Facets
                </Checkbox>
                <Checkbox value="Customization" isChecked={visibility.Customization} onChange={handleChange}>
                  Customization
                </Checkbox>
              </SimpleGrid>
            </PopoverBody>
            <PopoverFooter>
              <Flex justifyContent="space-between">
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="solid" colorScheme="primary" onClick={() => onSubmit(onClose)}>
                  Apply
                </Button>
              </Flex>
            </PopoverFooter>
          </PopoverContent>
        </>
      )}
    </Popover>
  )
}

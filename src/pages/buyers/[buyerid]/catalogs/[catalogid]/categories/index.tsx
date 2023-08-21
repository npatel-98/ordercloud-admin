import {
  Box,
  Grid,
  GridItem,
  HStack,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure
} from "@chakra-ui/react"
import {Categories, Category} from "ordercloud-javascript-sdk"
import {useCallback, useEffect, useState} from "react"

import Card from "components/card/Card"
import {CreateUpdateForm} from "components/categories"
import ExportToCsv from "components/demo/ExportToCsv"
import {ICategory} from "types/ordercloud/ICategoryXp"
import React from "react"
import TreeView from "components/dndtreeview/TreeView"
import {ocNodeModel} from "@minoru/react-dnd-treeview"
import {useRouter} from "hooks/useRouter"

/* This declare the page title and enable the breadcrumbs in the content header section. */
export async function getServerSideProps() {
  return {
    props: {
      header: {
        title: "Categories List",
        metas: {
          hasBreadcrumbs: true,
          hasBuyerContextSwitch: false
        }
      },
      revalidate: 5 * 60
    }
  }
}

const CategoriesList = (props) => {
  const [categoriesTreeView, setCategoriesTreeView] = useState([])
  const [selectedNode, setSelectedNode] = useState<ocNodeModel>(null)
  const router = useRouter()
  const {isOpen: isCategoryCreateOpen, onOpen: onOpenCategoryCreate, onClose: onCloseCategoryCreate} = useDisclosure()
  const [parentIdToCreate, setParentIdToCreate] = useState(null)

  const initCategoriesData = useCallback(
    async (catalogid: string) => {
      const categoriesList = await Categories.List<ICategory>(catalogid)
      if (selectedNode) {
        const selectedCategoryId = selectedNode.data.ID
        const selectedCategoryExists = categoriesList.Items.find((category) => category.ID === selectedCategoryId)
        if (!selectedCategoryExists) {
          setSelectedNode(null)
        }
      }
      setCategoriesTreeView(await buildTreeView(categoriesList.Items))
    },
    [selectedNode]
  )

  useEffect(() => {
    initCategoriesData(router.query.catalogid as string)
  }, [router.query.catalogid, initCategoriesData])

  async function buildTreeView(treeData: any[]) {
    const treeViewData = treeData.map((item) => {
      return {
        id: item.ID,
        parent: item.ParentID ? item.ParentID : "-",
        text: item.Name,
        type: "category",
        droppable: true,
        data: item
      }
    })
    treeViewData.push({
      id: "__CREATE_CATEGORY_BUTTON__",
      parent: "-",
      text: "",
      droppable: false,
      type: "button",
      data: {}
    })

    return treeViewData
  }
  const handleSelect = (node: ocNodeModel) => setSelectedNode(node)

  const handleCategoryCreate = (category: Category) => {
    setParentIdToCreate(category?.ID)
    onOpenCategoryCreate()
  }

  const onCategoryCreateSuccess = async (category: Category) => {
    onCloseCategoryCreate()
    await initCategoriesData(router.query.catalogid as string)
  }

  return (
    <>
      <Box padding="20px">
        <HStack justifyContent="end" w="100%" mb={5}>
          <HStack>
            <ExportToCsv />
          </HStack>
        </HStack>
        <Card variant="primaryCard">
          <Grid
            templateAreas={`"header header"
                  "nav main"
                  "nav footer"`}
            gridTemplateRows={"auto 1fr 30px"}
            gridTemplateColumns={"auto 1fr"}
            h="auto"
            gap="1"
            color="blackAlpha.700"
            fontWeight="bold"
          >
            <GridItem pl="2" area={"header"}></GridItem>
            <GridItem pl="2" area={"nav"} width="300px">
              <TreeView
                treeData={categoriesTreeView}
                selectedNode={selectedNode}
                handleSelect={handleSelect}
                handleCategoryCreate={handleCategoryCreate}
                {...props}
              />
            </GridItem>
            <GridItem pl="2" area={"main"}>
              {selectedNode ? (
                <CreateUpdateForm
                  category={selectedNode.data}
                  onSuccess={onCategoryCreateSuccess}
                  headerComponent={
                    <Heading as="h5" size="md" marginLeft={10} marginTop={5}>
                      Update the selected category
                    </Heading>
                  }
                />
              ) : (
                <CreateUpdateForm
                  onSuccess={onCategoryCreateSuccess}
                  category={{Name: "", Description: "", Active: false, ParentID: ""}}
                  headerComponent={
                    <Heading as="h5" size="md" marginLeft={10} marginTop={5}>
                      Create root category
                    </Heading>
                  }
                />
              )}
            </GridItem>
            <GridItem pl="2" area={"footer"}></GridItem>
          </Grid>
        </Card>
      </Box>
      <Modal size="2xl" isOpen={isCategoryCreateOpen} onClose={onCloseCategoryCreate}>
        <ModalOverlay backdropFilter="blur(10px) hue-rotate(90deg)" />
        <ModalContent>
          <ModalHeader>Create category</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <CreateUpdateForm parentId={parentIdToCreate} onSuccess={onCategoryCreateSuccess} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export default CategoriesList

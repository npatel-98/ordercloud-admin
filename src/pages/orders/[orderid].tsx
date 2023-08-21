import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Container,
  Card,
  Divider,
  Flex,
  Grid,
  GridItem,
  HStack,
  Input,
  Spacer,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Textarea,
  Tr,
  VStack,
  Heading
} from "@chakra-ui/react"
import {IntegrationEvents, OrderReturn, OrderReturns, OrderWorksheet, Orders} from "ordercloud-javascript-sdk"
import React, {FunctionComponent, useEffect, useRef, useState} from "react"
import {dateHelper, priceHelper} from "utils/"

import AddressCard from "../../components/card/AddressCard"
import ExportToCsv from "components/demo/ExportToCsv"
import ExportToPdf from "components/demo/ExportToPdf"
import {IOrderReturn} from "types/ordercloud/IOrderReturn"
import LettersCard from "components/card/LettersCard"
import LineItemList from "components/shoppingcart/LineItemList"
import {Link} from "components/navigation/Link"
import {NextSeo} from "next-seo"
import PrintShippingLabel from "components/demo/PrintShippingLabel"
import ProtectedContent from "components/auth/ProtectedContent"
import {appPermissions} from "constants/app-permissions.config"
import {useRouter} from "hooks/useRouter"
import {useSuccessToast} from "hooks/useToast"

/* This declare the page title and enable the breadcrumbs in the content header section. */
export async function getServerSideProps() {
  return {
    props: {
      header: {
        title: "Order Details",
        metas: {
          hasBreadcrumbs: true,
          hasBuyerContextSwitch: false
        }
      }
    }
  }
}

const OrderConfirmationPage: FunctionComponent = () => {
  const router = useRouter()
  const [orderWorksheet, setOrderWorksheet] = useState({} as OrderWorksheet)
  const [orderReturns, setOrderReturns] = useState({} as OrderReturn[])
  const [isRefundDialogOpen, setRefundDialogOpen] = useState(false)
  const [returnComments, setReturnComments] = useState("")
  const [orderReturn, setOrderReturn] = useState({} as OrderReturn)
  const [orderShip, setOrderShip] = useState(false)
  const [loading, setLoading] = useState(false)
  const cancelRef = useRef()
  const successToast = useSuccessToast()

  const requestRefund = () => {
    setOrderReturn({
      OrderID: orderWorksheet.Order.ID,
      RefundAmount: orderWorksheet.Order.Total,
      Comments: returnComments
    })
  }

  const handleReturnCommentChange = (event: React.FormEvent<HTMLTextAreaElement>) => {
    setReturnComments(event.currentTarget.value)
  }

  useEffect(() => {
    const getOrder = async () => {
      const orderId = router.query.orderid as string
      if (!orderId) {
        return
      }
      const [worksheet, returns] = await Promise.all([
        IntegrationEvents.GetWorksheet("All", orderId),
        OrderReturns.List<IOrderReturn>({filters: {OrderID: orderId}})
      ])
      setOrderWorksheet(worksheet)
      setOrderReturns(returns.Items)
    }

    if (!orderReturn?.OrderID) {
      getOrder()
    }
  }, [router.query.orderid, orderReturn])

  useEffect(() => {
    const shipOrder = async () => {
      const orderId = router.query.orderid as string
      if (!orderId) {
        return
      }
      await Orders.Complete("All", orderId)
      const worksheet = await IntegrationEvents.GetWorksheet("All", orderId)
      setOrderWorksheet(worksheet)
    }

    if (orderShip) {
      shipOrder()
    }
  }, [router.query.orderid, orderShip])

  useEffect(() => {
    const createReturn = async () => {
      try {
        setLoading(true)
        const submittedReturn = await OrderReturns.Create<IOrderReturn>(orderReturn)
        await OrderReturns.Submit(submittedReturn.ID)
        setOrderReturn({} as OrderReturn)
        setLoading(false)
        setRefundDialogOpen(false)
        successToast({
          title: "Refund requested!",
          description: "If approved, amount will be credited to you"
        })
      } catch {
        setRefundDialogOpen(false)
      }
    }
    if (orderReturn?.OrderID) {
      createReturn()
    }
  }, [orderReturn, successToast])

  if (!orderWorksheet?.Order?.ID) {
    return (
      <>
        <NextSeo title="Order" />
      </>
    )
  }

  const showRefundBtn = orderWorksheet.Order.Status === "Completed" && !orderReturns.length

  const showShipBtn = orderWorksheet.Order.Status === "Open"

  const refundBtn = showRefundBtn && <Button onClick={() => setRefundDialogOpen(true)}>Request Refund</Button>

  const shipBtn = showShipBtn && <Button onClick={() => setOrderShip(true)}>Ship Order</Button>

  const actionButtons = (showRefundBtn || showShipBtn) && (
    <Flex justifyContent="flex-start" marginBottom={10}>
      {refundBtn}
      {shipBtn}
    </Flex>
  )

  const getOrderStatus = (): string => {
    if (!orderReturns.length) {
      return orderWorksheet.Order.Status
    }
    return `Refund ${orderReturns[0].Status}`
  }

  const orderStatus = getOrderStatus()

  return (
    <>
      <Container maxW="100%" bgColor="st.mainBackgroundColor" flexGrow={1} p={[4, 6, 8]}>
        <NextSeo title="Order Details" />
        <HStack justifyContent="space-between" w="100%" mb={5}>
          <Link href={`/orders/new`} pl="2" pr="2">
            <Button variant="solid" colorScheme="primary">
              Place re-order
            </Button>
          </Link>
          <HStack>
            <PrintShippingLabel />
            <ExportToCsv />
            <ExportToPdf />
          </HStack>
        </HStack>
        <VStack gap={6}>
          <Card p={6} w="100%">
            <HStack justifyContent="space-between" w="100%" pr="60px">
              <Heading fontSize="2xl">Order Information</Heading>
              <Text>Status: {orderStatus}</Text>
            </HStack>

            <HStack alignItems="center" mt={4}>
              <LettersCard
                FirstName={orderWorksheet.Order.FromUser.FirstName}
                LastName={orderWorksheet.Order.FromUser.LastName}
              />
              <VStack textAlign="left" w="100%">
                <HStack textAlign="left" w="100%">
                  <Text textAlign="left">
                    {orderWorksheet.Order.FromUser.FirstName} &nbsp;
                    {orderWorksheet.Order.FromUser.LastName}
                  </Text>
                </HStack>
                {orderWorksheet.Order.FromUser.Phone && (
                  <Text textAlign="left" w="100%">
                    {orderWorksheet.Order.FromUser.Phone}
                  </Text>
                )}
                {orderWorksheet.Order.FromUser.Email && (
                  <Text textAlign="left" w="100%">
                    {orderWorksheet.Order.FromUser.Email}
                  </Text>
                )}
              </VStack>
            </HStack>

            <Grid templateColumns="repeat(3, 1fr)" gap={20} pt={20}>
              <GridItem w="100%">
                <VStack>
                  <Text width="full">Invoice Number</Text>
                  <Input placeholder="Invoice Number" defaultValue={orderWorksheet.Order.ID}></Input>
                  <Spacer pt="25px"></Spacer>
                  <Heading fontSize="lg" as="h3" w="full">
                    Billing Address
                  </Heading>
                  <AddressCard
                    Street1={orderWorksheet.Order.BillingAddress?.Street1}
                    Street2={orderWorksheet.Order.BillingAddress?.Street2}
                    City={orderWorksheet.Order.BillingAddress?.City}
                    State={orderWorksheet.Order.BillingAddress?.State}
                    Zip={orderWorksheet.Order.BillingAddress?.Zip}
                  />
                  <Spacer pt="25px"></Spacer>
                  <Text width="full">Buyer Comments</Text>
                  <Textarea defaultValue={orderWorksheet.Order.Comments} />
                </VStack>
              </GridItem>
              <GridItem w="100%">
                <VStack>
                  <Text width="full">Order Placed</Text>
                  <Input
                    placeholder="Order Placed"
                    defaultValue={dateHelper.formatDate(orderWorksheet.Order.DateSubmitted)}
                  ></Input>
                  <Spacer pt="25px"></Spacer>
                  <Heading fontSize="lg" as="h3" w="full">
                    Shipping Address
                  </Heading>
                  <AddressCard
                    Street1={orderWorksheet.LineItems[0].ShippingAddress?.Street1}
                    Street2={orderWorksheet.LineItems[0].ShippingAddress?.Street2}
                    City={orderWorksheet.LineItems[0].ShippingAddress?.City}
                    State={orderWorksheet.LineItems[0].ShippingAddress?.State}
                    Zip={orderWorksheet.LineItems[0].ShippingAddress?.Zip}
                  />
                </VStack>
              </GridItem>
              <GridItem w="100%" justifyContent="center" key={orderWorksheet.Order.ID}>
                <Box border="1px" borderColor="gray.200" padding="GlobalPadding" w="100%" maxW="450px">
                  <VStack>
                    <Heading fontSize="lg" as="h3" w="full" p={3}>
                      Order Recap
                    </Heading>
                    <Divider border="1px" borderColor="gray.200" />
                    <Flex flexDirection="column" marginLeft={10} w="full" pr="10" pl="10">
                      <Table size="sm" width="full" maxWidth="100%" marginBottom={5}>
                        <Tbody>
                          <Tr>
                            <Td>Subtotal</Td>
                            <Td textAlign="right">
                              <Text fontWeight="bold">{priceHelper.formatPrice(orderWorksheet.Order.Subtotal)}</Text>
                            </Td>
                          </Tr>
                          <Tr>
                            <Td>Promotion Discount</Td>
                            <Td textAlign="right">
                              <Text fontWeight="bold">
                                -{priceHelper.formatPrice(orderWorksheet.Order.PromotionDiscount)}
                              </Text>
                            </Td>
                          </Tr>
                          <Tr>
                            <Td>Shipping</Td>
                            <Td textAlign="right">
                              <Text fontWeight="bold">
                                {priceHelper.formatPrice(orderWorksheet.Order.ShippingCost)}
                              </Text>
                            </Td>
                          </Tr>
                          <Tr>
                            <Td>Tax</Td>
                            <Td textAlign="right">
                              <Text fontWeight="bold">{priceHelper.formatPrice(orderWorksheet.Order.TaxCost)}</Text>
                            </Td>
                          </Tr>
                          <Tr>
                            <Td>Order Total</Td>
                            <Td textAlign="right">
                              <Text fontWeight="bold">{priceHelper.formatPrice(orderWorksheet.Order.Total)}</Text>
                            </Td>
                          </Tr>
                        </Tbody>
                      </Table>
                    </Flex>
                  </VStack>
                </Box>
              </GridItem>
            </Grid>
          </Card>
          {actionButtons}
          <Card p={6} w="100%">
            <HStack justifyContent="space-between" w="100%" pr="60px" mb="30px">
              <VStack alignContent="left" align="flex-start">
                <Heading fontSize="2xl">Ship From</Heading>
                <Text fontSize="18px">Distributor Main Warehouse</Text>
                <Text fontSize="14px">123 First Avenue, Minneapolis, MN 55347</Text>
              </VStack>
              <VStack alignContent="right" align="flex-end">
                <Text fontSize="GlobalPadding" fontWeight="600" color="gray.300" textAlign="right">
                  Ship Method
                </Text>
                <Text textAlign="right">FEDEX 2 DAY SHIPPING, EST ARRIVAL DATE 1/1/2023</Text>
              </VStack>
            </HStack>

            <LineItemList lineItems={orderWorksheet.LineItems} editable={false} />
          </Card>
        </VStack>
      </Container>
      <AlertDialog
        isOpen={isRefundDialogOpen}
        onClose={() => setRefundDialogOpen(false)}
        leastDestructiveRef={cancelRef}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Request Refund
            </AlertDialogHeader>
            <AlertDialogBody>
              <Text display="inline">
                A return for this order will be requested and if approved will refund the balance of
              </Text>{" "}
              <Text display="inline" color="accent.500" fontWeight="bold">
                {priceHelper.formatPrice(orderWorksheet.Order.Total)}
              </Text>
              <Textarea
                marginTop={8}
                placeholder="Optional comments"
                defaultValue={returnComments}
                onChange={handleReturnCommentChange}
              />
            </AlertDialogBody>
            <AlertDialogFooter justifyContent="space-between" w="100%">
              <Button ref={cancelRef} onClick={() => setRefundDialogOpen(false)} disabled={loading} variant="outline">
                Cancel
              </Button>
              <Button onClick={requestRefund} disabled={loading}>
                {loading ? <Spinner color="accent.500" /> : "Request Refund"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
      {/* <AlertDialog
        isOpen={isExportCSVDialogOpen}
        onClose={() => setExportCSVDialogOpen(false)}
        leastDestructiveRef={cancelRef}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Export Selected Orders to CSV
            </AlertDialogHeader>
            <AlertDialogBody>
              <Text display="inline">
                Export the selected orders to a CSV, once the export button is clicked behind the scenes a job will be
                kicked off to create the csv and then will automatically download to your downloads folder in the
                browser.
              </Text>
            </AlertDialogBody>
            <AlertDialogFooter>
              <HStack justifyContent="space-between" w="100%">
                <Button
                  ref={cancelRef}
                  onClick={() => setExportCSVDialogOpen(false)}
                  disabled={loading}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button onClick={requestExportCSV} disabled={loading}>
                  {loading ? <Spinner color="accent.500" /> : "Export Orders CSV"}
                </Button>
              </HStack>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog> */}

      {/* <AlertDialog
        isOpen={isExportPDFDialogOpen}
        onClose={() => setExportPDFDialogOpen(false)}
        leastDestructiveRef={cancelRef}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Export Selected Orders to PDF
            </AlertDialogHeader>
            <AlertDialogBody>
              <Text display="inline">
                Export the selected orders to a PDF, once the export button is clicked behind the scense a job will be
                kicked off to create the pdf and then will automatically download to your downloads folder in the
                browser.
              </Text>
            </AlertDialogBody>
            <AlertDialogFooter>
              <HStack justifyContent="space-between" w="100%">
                <Button
                  ref={cancelRef}
                  onClick={() => setExportPDFDialogOpen(false)}
                  disabled={loading}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button onClick={requestExportPDF} disabled={loading}>
                  {loading ? <Spinner color="accent.500" /> : "Export Orders PDF"}
                </Button>
              </HStack>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog> */}

      {/* <AlertDialog
        isOpen={isPrintLabelDialogOpen}
        onClose={() => setPrintLabelDialogOpen(false)}
        leastDestructiveRef={cancelRef}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Print Labels for Selected Orders
            </AlertDialogHeader>
            <AlertDialogBody>
              <Text display="inline">
                Print Labels for the selected orders onto an Avery label, once the button is clicked behind the scenes a
                job will be kicked off to create the labels in PDF format and then will automatically download to your
                downloads folder in the browser.
              </Text>
            </AlertDialogBody>
            <AlertDialogFooter>
              <HStack justifyContent="space-between" w="100%">
                <Button
                  ref={cancelRef}
                  onClick={() => setPrintLabelDialogOpen(false)}
                  disabled={loading}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button onClick={requestPrintLabel} disabled={loading}>
                  {loading ? <Spinner color="accent.500" /> : "Print Labels"}
                </Button>
              </HStack>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog> */}
    </>
  )
}

const ProtectedOrderConfirmationPage = () => {
  return (
    <ProtectedContent hasAccess={appPermissions.OrderManager}>
      <OrderConfirmationPage />
    </ProtectedContent>
  )
}

export default ProtectedOrderConfirmationPage

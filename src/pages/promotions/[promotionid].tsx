import {useEffect, useState} from "react"
import {CreateUpdateForm} from "../../components/promotions/CreateUpdateForm"
import {Box, Container, Skeleton} from "@chakra-ui/react"
import {Promotion, Promotions} from "ordercloud-javascript-sdk"
import ProtectedContent from "components/auth/ProtectedContent"
import {appPermissions} from "constants/app-permissions.config"
import {useRouter} from "hooks/useRouter"
import {IPromotion} from "types/ordercloud/IPromotion"

/* This declare the page title and enable the breadcrumbs in the content header section. */
export async function getServerSideProps() {
  return {
    props: {
      header: {
        title: "Update promotion",
        metas: {
          hasBreadcrumbs: true,
          hasBuyerContextSwitch: false
        }
      },
      revalidate: 5 * 60
    }
  }
}

const PromotionItem = (props) => {
  const router = useRouter()
  const [promotion, setPromotion] = useState({} as Promotion)
  useEffect(() => {
    const getPromotion = async () => {
      const promo = await Promotions.Get<IPromotion>(router.query.promotionid as string)
      setPromotion(promo)
    }
    if (router.query.promotionid) {
      getPromotion()
    }
  }, [router.query.promotionid])
  console.log(promotion)
  return (
    <>
      {promotion?.ID ? (
        <CreateUpdateForm promotion={promotion} />
      ) : (
        <Container maxW="100%" bgColor="st.mainBackgroundColor" flexGrow={1} p={[4, 6, 8]}>
          <Skeleton w="100%" h="544px" borderRadius="md" />
        </Container>
      )}
    </>
  )
}

const ProtectedPromotionItem = () => {
  return (
    <ProtectedContent hasAccess={appPermissions.OrderManager}>
      <PromotionItem />
    </ProtectedContent>
  )
}

export default ProtectedPromotionItem

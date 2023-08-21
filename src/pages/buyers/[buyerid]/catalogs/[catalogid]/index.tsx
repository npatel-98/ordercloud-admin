import {Catalog, Catalogs} from "ordercloud-javascript-sdk"
import {useEffect, useState} from "react"

import {CreateUpdateForm} from "components/catalogs/CreateUpdateForm"
import {ICatalog} from "types/ordercloud/ICatalog"
import ProtectedContent from "components/auth/ProtectedContent"
import {appPermissions} from "constants/app-permissions.config"
import {useRouter} from "hooks/useRouter"
import {Container, Skeleton} from "@chakra-ui/react"

/* This declare the page title and enable the breadcrumbs in the content header section. */
export async function getServerSideProps() {
  return {
    props: {
      header: {
        title: "Edit catalog",
        metas: {
          hasBreadcrumbs: true,
          hasBuyerContextSwitch: true
        }
      },
      revalidate: 5 * 60
    }
  }
}

const CatalogListItem = () => {
  const router = useRouter()
  const [catalog, setCatalog] = useState({} as Catalog)
  useEffect(() => {
    if (router.query.catalogid) {
      Catalogs.Get<ICatalog>(router.query.catalogid as string).then((catalog) => setCatalog(catalog))
    }
  }, [router.query.catalogid])
  return (
    <>
      {catalog?.ID ? (
        <CreateUpdateForm catalog={catalog} />
      ) : (
        <Container maxW="100%" bgColor="st.mainBackgroundColor" flexGrow={1} p={[4, 6, 8]}>
          <Skeleton w="100%" h="544px" borderRadius="md" />
        </Container>
      )}
    </>
  )
}

const ProtectedBuyerListItem = () => {
  return (
    <ProtectedContent hasAccess={appPermissions.BuyerManager}>
      <CatalogListItem />
    </ProtectedContent>
  )
}

export default ProtectedBuyerListItem

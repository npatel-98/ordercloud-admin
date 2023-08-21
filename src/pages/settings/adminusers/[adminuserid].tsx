import {useEffect, useState} from "react"
import {CreateUpdateForm} from "components/adminusers"
import {Box, Container, Skeleton} from "@chakra-ui/react"
import {AdminUserGroups, AdminUsers, User} from "ordercloud-javascript-sdk"
import ProtectedContent from "components/auth/ProtectedContent"
import {appPermissions} from "constants/app-permissions.config"
import {useRouter} from "hooks/useRouter"
import {IAdminUser} from "types/ordercloud/IAdminUser"

export async function getServerSideProps() {
  return {
    props: {
      header: {
        title: "Edit admin user",
        metas: {
          hasBreadcrumbs: true,
          hasBuyerContextSwitch: false
        }
      },
      revalidate: 5 * 60
    }
  }
}

const AdminUserListItem = () => {
  const router = useRouter()
  const [adminUser, setAdminUser] = useState({} as User)
  const [permissions, setPermissions] = useState([])
  useEffect(() => {
    const getAdminUser = async () => {
      const user = await AdminUsers.Get<IAdminUser>(router.query.adminuserid as string)
      const userGroupAssignments = await AdminUserGroups.ListUserAssignments({userID: user.ID})
      setPermissions(userGroupAssignments.Items.map((p) => p.UserGroupID))
      setAdminUser(user)
    }
    if (router.query.adminuserid) {
      getAdminUser()
    }
  }, [router.query.adminuserid])
  return (
    <>
      {adminUser?.ID ? (
        <CreateUpdateForm user={adminUser} assignedPermissions={permissions} />
      ) : (
        <Container maxW="100%" bgColor="st.mainBackgroundColor" flexGrow={1} p={[4, 6, 8]}>
          <Skeleton w="100%" h="544px" borderRadius="md" />
        </Container>
      )}
    </>
  )
}

const ProtectedAdminUserListItem = () => {
  return (
    <ProtectedContent hasAccess={appPermissions.SettingsManager}>
      <AdminUserListItem />
    </ProtectedContent>
  )
}

export default ProtectedAdminUserListItem

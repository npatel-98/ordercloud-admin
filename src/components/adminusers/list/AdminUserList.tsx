import {Box, Container, Tag, Text, useDisclosure} from "@chakra-ui/react"
import Link from "next/link"
import {AdminUsers} from "ordercloud-javascript-sdk"
import {useCallback, useState} from "react"
import {IAdminUser} from "types/ordercloud/IAdminUser"
import {DataTableColumn} from "../../shared/DataTable/DataTable"
import ListView, {ListViewGridOptions, ListViewTableOptions} from "../../shared/ListView/ListView"
import AdminUserDeleteModal from "../modals/AdminUserDeleteModal"
import AdminUserActionMenu from "./AdminUserActionMenu"
import AdminUserCard from "./AdminUserCard"
import AdminUserListToolbar from "./AdminUserListToolbar"

const AdminUserQueryMap = {
  s: "Search",
  sort: "SortBy",
  p: "Page"
}

const AdminUserFilterMap = {
  active: "Active"
}

const FirstNameColumn: DataTableColumn<IAdminUser> = {
  header: "First Name",
  accessor: "FirstName",
  width: "15%",
  cell: ({row, value}) => (
    <Text noOfLines={2} title={value}>
      {value}
    </Text>
  ),
  sortable: true
}

const LastNameColumn: DataTableColumn<IAdminUser> = {
  header: "Last Name",
  accessor: "LastName",
  width: "15%",
  cell: ({row, value}) => (
    <Text noOfLines={2} title={value}>
      {value}
    </Text>
  ),
  sortable: true
}

const EmailColumn: DataTableColumn<IAdminUser> = {
  header: "Email",
  accessor: "Email",
  width: "15%",
  cell: ({row, value}) => (
    <Text noOfLines={2} title={value}>
      {value}
    </Text>
  ),
  sortable: true
}

const StatusColumn: DataTableColumn<IAdminUser> = {
  header: "Status",
  accessor: "Active",
  width: "1%",
  align: "center",
  cell: ({row, value}) => <Tag colorScheme={value ? "success" : "danger"}>{value ? "Active" : "Inactive"}</Tag>,
  sortable: false
}

const AdminUserTableOptions: ListViewTableOptions<IAdminUser> = {
  responsive: {
    base: [FirstNameColumn, LastNameColumn],
    md: [FirstNameColumn, LastNameColumn, StatusColumn],
    lg: [FirstNameColumn, LastNameColumn, StatusColumn],
    xl: [FirstNameColumn, LastNameColumn, EmailColumn, StatusColumn]
  }
}

const AdminUserList = () => {
  const [actionAdminUser, setActionAdminUser] = useState<IAdminUser>()
  const deleteDisclosure = useDisclosure()

  const renderAdminUserActionsMenu = useCallback(
    (adminUser: IAdminUser) => {
      return (
        <AdminUserActionMenu
          adminUser={adminUser}
          onOpen={() => setActionAdminUser(adminUser)}
          onDelete={deleteDisclosure.onOpen}
        />
      )
    },
    [deleteDisclosure.onOpen]
  )

  const resolveAdminUserDetailHref = (user: IAdminUser) => {
    return `/settings/adminusers/${user.ID}`
  }

  return (
    <ListView<IAdminUser>
      service={AdminUsers.List}
      queryMap={AdminUserQueryMap}
      filterMap={AdminUserFilterMap}
      itemHrefResolver={resolveAdminUserDetailHref}
      itemActions={renderAdminUserActionsMenu}
      tableOptions={AdminUserTableOptions}
    >
      {({renderContent, items, ...listViewChildProps}) => (
        <Container maxW="100%" bgColor="st.mainBackgroundColor" flexGrow={1} p={[4, 6, 8]}>
          <Box>
            <AdminUserListToolbar {...listViewChildProps} />
          </Box>
          {renderContent}
          <AdminUserDeleteModal
            onComplete={listViewChildProps.removeItems}
            adminUsers={
              actionAdminUser
                ? [actionAdminUser]
                : items
                ? items.filter((adminUser) => listViewChildProps.selected.includes(adminUser.ID))
                : []
            }
            disclosure={deleteDisclosure}
          />
        </Container>
      )}
    </ListView>
  )
}

export default AdminUserList

// ** React Imports
import { useState, useEffect, forwardRef } from 'react'

// ** Next Import
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { DataGrid, GridRowId } from '@mui/x-data-grid'
import Button from '@mui/material/Button'
// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Store & Actions Imports
import { useDispatch, useSelector } from 'react-redux'
import { fetchData, deleteInvoice } from 'src/store/apps/invoice'

// ** Types Imports
import { RootState, AppDispatch } from 'src/store'
import { ThemeColor } from 'src/@core/layouts/types'

import { TestType } from './testingTypes'

import { getInitials } from 'src/@core/utils/get-initials'

// ** Custom Components Imports
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'
import TestTableHeader from './TestTableHeader'

// ** Styled Components
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import { constInvoices } from './testsData'

import { AddTestCaseDialog } from './AddTestCaseDialog'

interface InvoiceStatusObj {
  [key: string]: {
    icon: string
    color: ThemeColor
  }
}

interface CellType {
  row: TestType
}

// ** Styled component for the link in the dataTable
const LinkStyled = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.primary.main
}))

// ** Vars
const invoiceStatusObj: InvoiceStatusObj = {
  Sent: { color: 'secondary', icon: 'mdi:send' },
  Paid: { color: 'success', icon: 'mdi:check' },
  Draft: { color: 'primary', icon: 'mdi:content-save-outline' },
  'Partial Payment': { color: 'warning', icon: 'mdi:chart-pie' },
  'Past Due': { color: 'error', icon: 'mdi:information-outline' },
  Downloaded: { color: 'info', icon: 'mdi:arrow-down' }
}

// ** renders client column
const renderClient = (row: TestType) => {
  return (
    <>
      <CustomAvatar
        skin='light'
        color={(row.avatarColor as ThemeColor) || ('primary' as ThemeColor)}
        sx={{ mr: 3, fontSize: '.8rem', width: '1.875rem', height: '1.875rem' }}
      >
        {getInitials(row.name || 'John Doe')}
      </CustomAvatar>
    </>
  )
}

const InvoiceList = () => {
  // ** State
  const [dates, setDates] = useState<Date[]>([])
  const [value, setValue] = useState<string>('')
  const [pageSize, setPageSize] = useState<number>(10)
  const [statusValue, setStatusValue] = useState<string>('')
  const [selectedRows, setSelectedRows] = useState<GridRowId[]>([])

  // ** Hooks
  const dispatch = useDispatch<AppDispatch>()
  const store = useSelector((state: RootState) => state.invoice)
  // read testsData from local storage in not present read from
  const [testsData, setTestsData] = useState(null)
  useEffect(() => {
    const storedData = localStorage.getItem('myData')
    if (storedData !== null) {
      setTestsData(JSON.parse(storedData))
    } else {
      setTestsData(constInvoices)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('myData', JSON.stringify(testsData))
  }, [testsData])
  const columns = [
    {
      flex: 0.1,
      minWidth: 100,
      field: 'total',
      headerName: 'Set',
      renderCell: ({ row }: CellType) => <Typography variant='body1'>{`${row.total || 0}`}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'total2',
      headerName: 'Test',
      renderCell: ({ row }: CellType) => <Typography variant='body1'>{`${row.total2 || 0}`}</Typography>,
      // sortable: false
      filterable: false
    },
    {
      flex: 0.25,
      field: 'name',
      minWidth: 300,
      headerName: 'Client',
      renderCell: ({ row }: CellType) => {
        const { name, companyEmail } = row

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', overflow: 'visible' }}>
            {renderClient(row)}
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
                {name}
              </Typography>
              <Typography noWrap variant='caption'>
                {companyEmail}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.1,
      minWidth: 90,
      field: 'balance',
      headerName: 'Balance',
      renderCell: ({ row }: CellType) => {
        return row.balance !== 0 ? (
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {row.balance}
          </Typography>
        ) : (
          <CustomChip size='small' skin='light' color='success' label='Paid' />
        )
      }
    },
    {
      flex: 0.1,
      minWidth: 90,
      field: 'contact',
      headerName: 'Contact',
      renderCell: ({ row }: CellType) => {
        return (
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {row.contact}
          </Typography>
        )
      }
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'deleteEnt',
      headerName: 'Delete',
      // renderCell: ({ row }: CellType) => <Typography variant='body1'>{`${row.total2 || 0}`}</Typography>,
      renderCell: ({ row }: CellType) => <Button onClick={() => handelDelete(row.id)}>DELETE</Button>,

      filterable: false
    }
  ]

  const handelDelete = id => {
    console.log(`TEMPLOG: ${id}`)

    if (testsData && id) {
      setTestsData(currentTestData => {
        return currentTestData.filter(it => {
          return it.id !== id
        })
      })
    }
  }

  useEffect(() => {
    dispatch(
      fetchData({
        dates,
        q: value,
        status: statusValue
      })
    )
  }, [dispatch, statusValue, value, dates])

  const handleFilter = (val: string) => {
    setValue(val)
  }

  return (
    <DatePickerWrapper>
      <Grid container spacing={6}>
        <Grid item xs={12}></Grid>
        <Grid item xs={12}>
          <Card>
            <Box
              sx={{
                p: 5,
                pb: 3,
                width: '100%',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <TestTableHeader value={value} selectedRows={selectedRows} handleFilter={handleFilter} />

              {/* <Button sx={{ mb: 2 }} component={Link} variant='contained' href='/apps/invoice/add'>
                Add Test Case
              </Button> */}
              <AddTestCaseDialog testsData={testsData} setTestsData={setTestsData} />
            </Box>
            {testsData && (
              <DataGrid
                autoHeight
                pagination
                // rows={constInvoices}
                rows={testsData}
                columns={columns}
                checkboxSelection // check box infront of each row
                disableSelectionOnClick
                pageSize={Number(pageSize)}
                rowsPerPageOptions={[10, 25, 50]}
                onSelectionModelChange={rows => setSelectedRows(rows)}
                onPageSizeChange={newPageSize => setPageSize(newPageSize)}
                // disableColumnMenu
              />
            )}
          </Card>
        </Grid>
      </Grid>
    </DatePickerWrapper>
  )
}

export default InvoiceList

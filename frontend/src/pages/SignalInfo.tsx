import { useEffect, useState, ChangeEvent } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import Button from "@mui/material/Button"
import Select from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import IconButton from "@mui/material/IconButton"
import FilterListIcon from "@mui/icons-material/FilterList"
import FirstPageIcon from "@mui/icons-material/FirstPage"
import LastPageIcon from "@mui/icons-material/LastPage"
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft"
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight"
import TextField from "@mui/material/TextField"
import { useAppDispatch, useAppSelector } from "../store/hooks"
import { fetchAllSignals, Signal } from "../store/slices/metricsSlice"
import CircularProgress from "@mui/material/CircularProgress"
import * as XLSX from 'xlsx'
import { format } from 'date-fns'

export default function SignalInfo() {
  const dispatch = useAppDispatch()
  const { signals, loading, error } = useAppSelector((state) => ({
    signals: state.metrics.signals,
    loading: state.metrics.loading,
    error: state.metrics.error
  }))
  
  // Pagination state
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  
  // Filter state
  const [filters, setFilters] = useState({
    signalID: "",
    zoneGroup: "",
    zone: "",
    corridor: "",
    subcorridor: "",
    agency: "",
    mainStreetName: "",
    sideStreetName: "",
    milepost: "",
    asOf: "",
    duplicate: "",
    include: "",
    modified: "",
    note: "",
    latitude: "",
    longitude: "",
    county: "",
    city: "",
    priority: "",
    classification: ""
  })

  // Fetch signals on component mount
  useEffect(() => {
    dispatch(fetchAllSignals())
  }, [dispatch])

  // Format date function
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), 'MM/dd/yyyy');
    } catch (error) {
      return dateString;
    }
  }

  // Filter signals based on filter criteria
  const filteredSignals = signals.filter((signal: Signal) => {
    return (
      (filters.signalID ? signal.signalID?.toLowerCase().includes(filters.signalID.toLowerCase()) : true) &&
      (filters.zoneGroup ? signal.zoneGroup?.toLowerCase().includes(filters.zoneGroup.toLowerCase()) : true) &&
      (filters.zone ? signal.zone?.toLowerCase().includes(filters.zone.toLowerCase()) : true) &&
      (filters.corridor ? signal.corridor?.toLowerCase().includes(filters.corridor.toLowerCase()) : true) &&
      (filters.subcorridor ? signal.subcorridor?.toLowerCase().includes(filters.subcorridor.toLowerCase()) : true) &&
      (filters.agency ? signal.agency?.toLowerCase().includes(filters.agency.toLowerCase()) : true) &&
      (filters.mainStreetName ? signal.mainStreetName?.toLowerCase().includes(filters.mainStreetName.toLowerCase()) : true) &&
      (filters.sideStreetName ? signal.sideStreetName?.toLowerCase().includes(filters.sideStreetName.toLowerCase()) : true) &&
      (filters.milepost ? signal.milepost?.toLowerCase().includes(filters.milepost.toLowerCase()) : true) &&
      (filters.asOf ? formatDate(signal.asOf).includes(filters.asOf) : true) &&
      (filters.duplicate ? signal.duplicate?.toLowerCase().includes(filters.duplicate.toLowerCase()) : true) &&
      (filters.include ? signal.include?.toLowerCase().includes(filters.include.toLowerCase()) : true) &&
      (filters.modified ? formatDate(signal.modified).includes(filters.modified) : true) &&
      (filters.note ? signal.note?.toLowerCase().includes(filters.note.toLowerCase()) : true) &&
      (filters.county ? signal.county?.toLowerCase().includes(filters.county.toLowerCase()) : true) &&
      (filters.city ? signal.city?.toLowerCase().includes(filters.city.toLowerCase()) : true) &&
      (filters.latitude ? signal.latitude.toString().includes(filters.latitude) : true) &&
      (filters.longitude ? signal.longitude.toString().includes(filters.longitude) : true) &&
      (filters.priority ? signal.priority?.toLowerCase().includes(filters.priority.toLowerCase()) : true) &&
      (filters.classification ? signal.classification?.toLowerCase().includes(filters.classification.toLowerCase()) : true)
    )
  })

  // Handle filter change
  const handleFilterChange = (event: ChangeEvent<HTMLInputElement>, field: string) => {
    setFilters({
      ...filters,
      [field]: event.target.value
    })
  }

  // Handle page change
  const handleChangePage = (newPage: number) => {
    setPage(newPage)
  }

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // Calculate pagination
  const paginatedSignals = filteredSignals.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  // Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredSignals)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Signals")
    XLSX.writeFile(workbook, "signals.xlsx")
  }

  // Common TableCell styling for headers
  const headerCellStyle = {
    backgroundColor: "#2196f3",
    padding: "16px 16px 8px 16px",
    border: "1px solid rgba(224, 224, 224, 1)",
  };

  // Title style for header text
  const headerTitleStyle = {
    color: "white",
    fontWeight: "bold",
    marginBottom: "8px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    textAlign: "center",
    display: "block",
    width: "100%"
  };

  // Common TableCell styling for data cells
  const dataCellStyle = {
    border: "1px solid rgba(224, 224, 224, 1)",
    padding: "8px 16px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "200px",
  };

  // Column definitions
  const columns = [
    { id: 'signalID', label: 'Signal ID', minWidth: 100 },
    { id: 'zoneGroup', label: 'Zone Group', minWidth: 150 },
    { id: 'zone', label: 'Zone', minWidth: 120 },
    { id: 'corridor', label: 'Corridor', minWidth: 150 },
    { id: 'subcorridor', label: 'Subcorridor', minWidth: 150 },
    { id: 'agency', label: 'Agency', minWidth: 120 },
    { id: 'mainStreetName', label: 'Main Street Name', minWidth: 180 },
    { id: 'sideStreetName', label: 'Side Street Name', minWidth: 180 },
    { id: 'milepost', label: 'Milepost', minWidth: 100 },
    { id: 'asOf', label: 'As Of', minWidth: 120 },
    { id: 'duplicate', label: 'Duplicate', minWidth: 100 },
    { id: 'include', label: 'Include', minWidth: 100 },
    { id: 'modified', label: 'Modified', minWidth: 120 },
    { id: 'note', label: 'Note', minWidth: 120 },
    { id: 'county', label: 'County', minWidth: 120 },
    { id: 'city', label: 'City', minWidth: 120 },
    { id: 'latitude', label: 'Latitude', minWidth: 120 },
    { id: 'longitude', label: 'Longitude', minWidth: 120 },
    { id: 'priority', label: 'Priority', minWidth: 120 },
    { id: 'classification', label: 'Classification', minWidth: 150 }
  ];

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Table Container */}
      <TableContainer sx={{ flex: 1, overflow: "auto" }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : (
          <Table 
            stickyHeader 
                  sx={{
              borderCollapse: 'separate',
              borderSpacing: 0,
              '& .MuiTableRow-root:nth-of-type(odd)': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell 
                    key={column.id}
                  sx={{
                      ...headerCellStyle,
                      minWidth: column.minWidth,
                    }}
                  >
                    <TextField
                      id="outlined-basic"
                      label={column.label}
                      variant="outlined"
                      sx={{
                        '& .MuiInputLabel-root': {
                          color: 'white',
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: 'white',
                        },
                      }}
                    />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedSignals.map((signal: Signal, index: number) => (
                <TableRow 
                  key={signal.signalID}
                >
                  <TableCell sx={dataCellStyle}>{signal.signalID}</TableCell>
                  <TableCell sx={dataCellStyle}>{signal.zoneGroup}</TableCell>
                  <TableCell sx={dataCellStyle}>{signal.zone}</TableCell>
                  <TableCell sx={dataCellStyle}>{signal.corridor}</TableCell>
                  <TableCell sx={dataCellStyle}>{signal.subcorridor}</TableCell>
                  <TableCell sx={dataCellStyle}>{signal.agency}</TableCell>
                  <TableCell sx={dataCellStyle}>{signal.mainStreetName}</TableCell>
                  <TableCell sx={dataCellStyle}>{signal.sideStreetName}</TableCell>
                  <TableCell sx={dataCellStyle}>{signal.milepost}</TableCell>
                  <TableCell sx={dataCellStyle}>{formatDate(signal.asOf)}</TableCell>
                  <TableCell sx={dataCellStyle}>{signal.duplicate}</TableCell>
                  <TableCell sx={dataCellStyle}>{signal.include}</TableCell>
                  <TableCell sx={dataCellStyle}>{formatDate(signal.modified)}</TableCell>
                  <TableCell sx={dataCellStyle}>{signal.note}</TableCell>
                  <TableCell sx={dataCellStyle}>{signal.county}</TableCell>
                  <TableCell sx={dataCellStyle}>{signal.city}</TableCell>
                  <TableCell sx={dataCellStyle}>{signal.latitude}</TableCell>
                  <TableCell sx={dataCellStyle}>{signal.longitude}</TableCell>
                  <TableCell sx={dataCellStyle}>{signal.priority}</TableCell>
                  <TableCell sx={dataCellStyle}>{signal.classification}</TableCell>
                </TableRow>
              ))}
              {paginatedSignals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center" sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}>
                    No signals found
              </TableCell>
            </TableRow>
              )}
            </TableBody>
        </Table>
        )}
      </TableContainer>

      {/* Bottom Controls */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 1,
          borderTop: "1px solid rgba(224, 224, 224, 1)",
        }}
      >
        {/* Export Button */}
        <Button
          variant="contained"
          onClick={exportToExcel}
          sx={{
            backgroundColor: "#2196f3",
            textTransform: "none",
            borderRadius: 1,
            boxShadow: 1,
          }}
        >
          Export To Excel
        </Button>

        {/* Pagination Controls */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="body2" sx={{ mr: 1 }}>
            Items per page:
          </Typography>
          <Select
            value={rowsPerPage}
            onChange={(e) => handleChangeRowsPerPage(e as ChangeEvent<HTMLInputElement>)}
            size="small"
            sx={{
              minWidth: 70,
              height: 32,
              mr: 2,
              "& .MuiSelect-select": {
                py: 0.5,
              },
            }}
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </Select>

          <Typography variant="body2" sx={{ mr: 2 }}>
            {filteredSignals.length > 0 ? 
              `${page * rowsPerPage + 1}-${Math.min((page + 1) * rowsPerPage, filteredSignals.length)} of ${filteredSignals.length}` : 
              '0 of 0'}
          </Typography>

          <Box sx={{ display: "flex" }}>
            <IconButton 
              size="small" 
              onClick={() => handleChangePage(0)} 
              disabled={page === 0 || filteredSignals.length === 0}
            >
              <FirstPageIcon />
            </IconButton>
            <IconButton 
              size="small" 
              onClick={() => handleChangePage(page - 1)} 
              disabled={page === 0 || filteredSignals.length === 0}
            >
              <KeyboardArrowLeft />
            </IconButton>
            <IconButton 
              size="small" 
              onClick={() => handleChangePage(page + 1)} 
              disabled={page >= Math.ceil(filteredSignals.length / rowsPerPage) - 1 || filteredSignals.length === 0}
            >
              <KeyboardArrowRight />
            </IconButton>
            <IconButton 
              size="small" 
              onClick={() => handleChangePage(Math.max(0, Math.ceil(filteredSignals.length / rowsPerPage) - 1))} 
              disabled={page >= Math.ceil(filteredSignals.length / rowsPerPage) - 1 || filteredSignals.length === 0}
            >
              <LastPageIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

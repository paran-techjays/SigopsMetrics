"use client"

import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../../store/hooks"
import Drawer from "@mui/material/Drawer"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Toolbar from "@mui/material/Toolbar"
import Radio from "@mui/material/Radio"
import RadioGroup from "@mui/material/RadioGroup"
import FormControlLabel from "@mui/material/FormControlLabel"
import FormControl from "@mui/material/FormControl"
import FormLabel from "@mui/material/FormLabel"
import TextField from "@mui/material/TextField"
import Select, { SelectChangeEvent } from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import InputLabel from "@mui/material/InputLabel"
import Divider from "@mui/material/Divider"
import IconButton from "@mui/material/IconButton"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import Checkbox from "@mui/material/Checkbox"
import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import CircularProgress from "@mui/material/CircularProgress"
import Alert from "@mui/material/Alert"

// Redux actions and thunks
import {
  setDateOption,
  setStartDate,
  setEndDate,
  setStartTime,
  setEndTime,
  setAllDayChecked,
  setAggregationOption,
  setSignalId,
  setSignalGroup,
  setDistrict,
  setAgency,
  setCounty,
  setCity,
  setCorridor,
  setSubcorridor,
  setPriority,
  setClassification,
  setErrorState,
  setIsFiltering,
  resetFilters,
  saveAsDefaults,
  loadSavedFilters,
  // Async thunks
  fetchZoneGroups,
  fetchZones,
  fetchZonesByZoneGroup,
  fetchAgencies,
  fetchCounties,
  fetchCities,
  fetchCorridors,
  fetchCorridorsByFilter,
  fetchSubcorridors,
  fetchSubcorridorsByCorridor,
  fetchPriorities,
  fetchClassifications,
  selectFilterParams,
  setFiltersApplied
} from "../../store/slices/filterSlice"
import { store } from "../../store"

// Date range and aggregation options
const dateRangeOptions = [
  { value: "0", label: "Prior Day" },
  { value: "1", label: "Prior Week" },
  { value: "2", label: "Prior Month" },
  { value: "3", label: "Prior Quarter" },
  { value: "4", label: "Prior Year" },
  { value: "5", label: "Custom" },
].sort((a, b) => parseInt(a.value) - parseInt(b.value));

const aggregationOptions = [
  { value: "0", label: "15 mins" },
  { value: "1", label: "1 hour" },
  { value: "2", label: "Daily" },
  { value: "3", label: "Weekly" },
  { value: "4", label: "Monthly" },
  { value: "5", label: "Quarterly" },
].sort((a, b) => parseInt(a.value) - parseInt(b.value));

interface FilterSidebarProps {
  open: boolean
  width: number
  onClose: () => void
  // Optional callback when filters are applied
  onApplyFilter?: (filters: any) => void
}

export default function FilterSidebar({ open, width, onClose, onApplyFilter }: FilterSidebarProps) {
  const dispatch = useAppDispatch();
  
  // Select filter state from Redux
  const {
    selectedDateOption,
    startDate,
    endDate,
    startTime,
    endTime,
    allDayChecked,
    selectedAggregationOption,
    signalId,
    selectedSignalGroup,
    selectedDistrict,
    selectedAgency,
    selectedCounty,
    selectedCity,
    selectedCorridor,
    selectedSubcorridor,
    selectedPriority,
    selectedClassification,
    // Dropdown options from API
    zoneGroups,
    zones,
    agencies,
    counties,
    cities,
    corridors,
    subcorridors,
    priorities,
    classifications,
    // Loading states
    loading,
    // Error state
    errorState
  } = useAppSelector(state => state.filter);

  // Load all filter data on component mount
  useEffect(() => {
    console.log("Initial component mount - loading all data");
    dispatch(loadSavedFilters());
    dispatch(fetchZoneGroups());
    dispatch(fetchZones());
    dispatch(fetchAgencies());
    dispatch(fetchCounties());
    dispatch(fetchCities());
    dispatch(fetchCorridors());
    dispatch(fetchPriorities());
    dispatch(fetchClassifications());
  }, [dispatch]);

  // === Event Handlers ===
  const handleDateRangeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = (event.target as HTMLInputElement).value;
    console.log(`Date range changed to: ${value}`);
    
    // Set filtering flag true before dispatching action
    // This matches the Angular behavior where isFiltering is set true on value changes
    dispatch(setIsFiltering(true));
    
    // Dispatch the setDateOption action which handles setting up appropriate date values
    dispatch(setDateOption(value));
    
    // If selecting Custom (5), set default dates to today
    if (value === "5") {
      // No need to set dates here as the reducer handles it
    } else {
      // Reset custom date fields for non-custom options
      // The reducer handles this, but we log it here for debugging
      console.log('Resetting custom date fields for non-custom date option');
    }
  }

  const handleAggregationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = (event.target as HTMLInputElement).value;
    console.log(`Aggregation changed to: ${value}`);
    
    // Set filtering flag true to match Angular behavior
    dispatch(setIsFiltering(true));
    
    // Dispatch the action to update aggregation option
    dispatch(setAggregationOption(value));
  }

  const handleSignalIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSignalId(event.target.value));
  }

  const handleAttributeChange = (actionCreator: any) => (event: SelectChangeEvent) => {
    const value = event.target.value as string;
    dispatch(actionCreator(value));
    
    // Just set isFiltering to true, no API calls
    dispatch(setIsFiltering(true));
    
    // Log selection changes for debugging
    console.log(`Changed ${actionCreator.name} to:`, value);
  }

  console.log("zones", zones);

  const handleAllDayChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    console.log(`All day checkbox ${checked ? 'checked' : 'unchecked'}`);
    
    // Mark as filtering
    dispatch(setIsFiltering(true));
    
    // Update the all day checked state
    dispatch(setAllDayChecked(checked));
  }

  const handleTimeChange = (actionCreator: any) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const isStartTime = actionCreator === setStartTime;
    console.log(`${isStartTime ? 'Start' : 'End'} time changed to: ${value}`);
    
    // Mark as filtering
    dispatch(setIsFiltering(true));
    
    // Update the time value
    dispatch(actionCreator(value));
  }

  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value || null;
    console.log(`Start date changed to: ${value}`);
    
    // Mark as filtering
    dispatch(setIsFiltering(true));
    
    // Update the start date
    dispatch(setStartDate(value));
  }

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value || null;
    console.log(`End date changed to: ${value}`);
    
    // Mark as filtering
    dispatch(setIsFiltering(true));
    
    // Update the end date
    dispatch(setEndDate(value));
  }

  const handleClear = () => {
    dispatch(resetFilters());
    // Reload all dropdown data
    dispatch(fetchZoneGroups());
    dispatch(fetchZones());
    dispatch(fetchAgencies());
    dispatch(fetchCounties());
    dispatch(fetchCities());
    dispatch(fetchCorridors());
    dispatch(fetchSubcorridors());
    dispatch(fetchPriorities());
    dispatch(fetchClassifications());
  }

  const handleApply = async () => {
    console.log('Applying filters');
    
    // Get current filter state using the selector
    const currentFilters = selectFilterParams(store.getState());
    
    // Make all necessary API calls based on current selections
    if (currentFilters.zone_Group) {
        await dispatch(fetchZonesByZoneGroup(currentFilters.zone_Group));
    }
    
    if (currentFilters.corridor) {
        await dispatch(fetchSubcorridorsByCorridor(currentFilters.corridor));
    }
    
    // Update corridors based on all selected filters
    await dispatch(fetchCorridorsByFilter({
        zoneGroup: currentFilters.zone_Group,
        zone: currentFilters.zone || undefined,
        agency: currentFilters.agency || undefined,
        county: currentFilters.county || undefined,
        city: currentFilters.city || undefined
    }));
    
    // Reset error state to normal when applying filters
    dispatch(setErrorState(1));
    
    // Set isFiltering to false to indicate filter is applied
    dispatch(setIsFiltering(false));
    
    // Set filtersApplied to true to trigger data refresh in dashboard
    dispatch(setFiltersApplied(true));
    
    // Call parent component callback if provided
    if (onApplyFilter) {
        onApplyFilter(currentFilters);
    }
    
    onClose();
  }

  const handleSaveDefaults = async () => {
    dispatch(saveAsDefaults());
    await handleApply();
  }

  // Check if any dropdown is loading
  const isLoading = Object.values(loading).some(status => status);

  return (
    <Drawer
      variant="persistent"
      anchor="right"
      open={open}
      sx={{
        width: open ? width : 0,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: width,
          boxSizing: "border-box",
          transition: (theme) => theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ p: 2, overflowY: "auto", height: 'calc(100% - 64px)' }}>
        {/* Header with loading indicator */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Typography variant="h6">
            Filters {isLoading && <CircularProgress size={16} sx={{ ml: 1 }} />}
          </Typography>
          <IconButton onClick={onClose} aria-label="close drawer">
            <ChevronRightIcon />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />

        {/* Error State Message */}
        {errorState === 2 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            The current metric is not fully compatible with the selected filter. Please select another metric or another filter.
          </Alert>
        )}

        {/* === Date Range === */}
        <FormControl component="fieldset" sx={{ mb: 2, width: "100%" }}>
          <FormLabel component="legend">Date Range</FormLabel>
          <RadioGroup value={selectedDateOption} onChange={handleDateRangeChange}>
            {dateRangeOptions.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio size="small" />}
                label={option.label}
              />
            ))}
          </RadioGroup>
        </FormControl>

        {/* Custom Date/Time Fields (Conditional) */}
        {selectedDateOption === "5" && (
          <Box sx={{ pl: 2, mb: 2 }}>
            <TextField
              label="Start Date"
              type="date"
              value={startDate || ''}
              onChange={handleStartDateChange}
              InputLabelProps={{ shrink: true }}
              size="small"
              fullWidth
              sx={{ mb: 1 }}
            />
            <TextField
              label="End Date"
              type="date"
              value={endDate || ''}
              onChange={handleEndDateChange}
              InputLabelProps={{ shrink: true }}
              size="small"
              fullWidth
              sx={{ mb: 2 }}
            />

            <Divider sx={{ my: 1 }} />
            <FormLabel component="legend" sx={{ mb: 1, fontSize: '0.8rem' }}>Time Range</FormLabel>
            <FormControlLabel
              control={<Checkbox checked={allDayChecked} onChange={handleAllDayChange} size="small" />}
              label="All day"
              sx={{ mb: 1 }}
            />
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <TextField
                label="Start Time"
                type="time"
                value={startTime}
                onChange={handleTimeChange(setStartTime)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }} // 5 min step
                size="small"
                sx={{ flexGrow: 1 }}
                disabled={allDayChecked}
              />
              <TextField
                label="End Time"
                type="time"
                value={endTime}
                onChange={handleTimeChange(setEndTime)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }} // 5 min step
                size="small"
                sx={{ flexGrow: 1 }}
                disabled={allDayChecked}
              />
            </Stack>
            <Divider sx={{ mb: 2 }} />
          </Box>
        )}

        {/* === Data Aggregation === */}
        <FormControl component="fieldset" sx={{ mb: 2, width: "100%" }}>
          <FormLabel component="legend">Data Aggregation</FormLabel>
          <RadioGroup value={selectedAggregationOption} onChange={handleAggregationChange}>
            {aggregationOptions.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio size="small" />}
                label={option.label}
                // Disable certain options based on date range (matching Angular logic)
                disabled={parseInt(selectedDateOption) < parseInt(option.value) && selectedDateOption !== "5"}
              />
            ))}
          </RadioGroup>
        </FormControl>
        <Divider sx={{ mb: 2 }} />

        {/* === Signal ID === */}
        <FormControl sx={{ mb: 2, width: "100%" }}>
          <FormLabel component="legend" sx={{ mb: 1 }}>
            Signal ID
          </FormLabel>
          <TextField
            size="small"
            placeholder="Enter ID"
            type="number"
            value={signalId}
            onChange={handleSignalIdChange}
            fullWidth
          />
        </FormControl>
        <Divider sx={{ mb: 2 }} />

        {/* === Signal Attributes (Conditional) === */}
        {!signalId && (
          <Box>
            <FormLabel component="legend" sx={{ mb: 1 }}>Signal Attributes</FormLabel>
            
            {/* Region */}
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Select Region</InputLabel>
              <Select
                value={selectedSignalGroup}
                label="Select Region"
                onChange={handleAttributeChange(setSignalGroup)}
                displayEmpty
                renderValue={(selected) => selected ? String(selected) : ''}
                disabled={loading.zoneGroups}
              >
                {zoneGroups.map((group) => (
                  <MenuItem key={group} value={group}>{group}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* District */}
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Select District</InputLabel>
              <Select
                value={selectedDistrict}
                label="Select District"
                onChange={handleAttributeChange(setDistrict)}
                displayEmpty
                renderValue={(selected) => selected ? String(selected) : ''}
                disabled={loading.zones}
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {loading.zones ? (
                  <MenuItem disabled>Loading districts...</MenuItem>
                ) : (
                  // Sort zones alphabetically
                  [...zones].sort().map((district) => (
                    <MenuItem key={district} value={district}>{district}</MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            {/* Managing Agency */}
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Select Managing Agency</InputLabel>
              <Select
                value={selectedAgency}
                label="Select Managing Agency"
                onChange={handleAttributeChange(setAgency)}
                displayEmpty
                renderValue={(selected) => selected ? String(selected) : ''}
                disabled={loading.agencies}
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {agencies.map((agency) => (
                  <MenuItem key={agency} value={agency}>{agency}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* County */}
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Select County</InputLabel>
              <Select
                value={selectedCounty}
                label="Select County"
                onChange={handleAttributeChange(setCounty)}
                displayEmpty
                renderValue={(selected) => selected ? String(selected) : ''}
                disabled={loading.counties}
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {counties.map((county) => (
                  <MenuItem key={county} value={county}>{county}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* City */}
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Select City</InputLabel>
              <Select
                value={selectedCity}
                label="Select City"
                onChange={handleAttributeChange(setCity)}
                displayEmpty
                renderValue={(selected) => selected ? String(selected) : ''}
                disabled={loading.cities}
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {cities.map((city) => (
                  <MenuItem key={city} value={city}>{city}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Corridor */}
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Select Corridor</InputLabel>
              <Select
                value={selectedCorridor}
                label="Select Corridor"
                onChange={handleAttributeChange(setCorridor)}
                displayEmpty
                renderValue={(selected) => selected ? String(selected) : ''}
                disabled={loading.corridors}
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {corridors.map((corridor) => (
                  <MenuItem key={corridor} value={corridor}>{corridor}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Subcorridor (Conditional based on selectedCorridor) */}
            {selectedCorridor && (
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Select Subcorridor</InputLabel>
                <Select
                  value={selectedSubcorridor}
                  label="Select Subcorridor"
                  onChange={handleAttributeChange(setSubcorridor)}
                  displayEmpty
                  renderValue={(selected) => selected ? String(selected) : ''}
                  disabled={loading.subcorridors}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {subcorridors.map((sub) => (
                    <MenuItem key={sub} value={sub}>{sub}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Priority */}
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Select Priority</InputLabel>
              <Select
                value={selectedPriority}
                label="Select Priority"
                onChange={handleAttributeChange(setPriority)}
                displayEmpty
                renderValue={(selected) => selected ? String(selected) : ''}
                disabled={loading.priorities}
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {priorities.map((priority) => (
                  <MenuItem key={priority} value={priority}>{priority}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Classification */}
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Select Classification</InputLabel>
              <Select
                value={selectedClassification}
                label="Select Classification"
                onChange={handleAttributeChange(setClassification)}
                displayEmpty
                renderValue={(selected) => selected ? String(selected) : ''}
                disabled={loading.classifications}
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {classifications.map((cls) => (
                  <MenuItem key={cls} value={cls}>{cls}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Action Buttons */}
        <Stack direction="row" spacing={1} justifyContent="space-evenly">
          <Button variant="outlined" onClick={handleSaveDefaults} size="small">
            Set As Defaults
          </Button>
          <Button variant="outlined" onClick={handleClear} size="small">
            Clear
          </Button>
          <Button variant="contained" onClick={handleApply} size="small">
            Apply
          </Button>
        </Stack>
      </Box>
    </Drawer>
  )
}


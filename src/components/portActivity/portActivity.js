import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Alert,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

const columns = [
  { field: "day", headerName: "Day", flex: 1 },
  { field: "activityType", headerName: "Activity Type", flex: 1 },
  { field: "fromDateTime", headerName: "From Date & Time", flex: 1 },
  { field: "duration", headerName: "Duration", flex: 1 },
  { field: "percentage", headerName: "%", flex: 1 },
  { field: "toDateTime", headerName: "To Date Time", flex: 1 },
  { field: "remarks", headerName: "Remarks", flex: 1 },
  { field: "deductions", headerName: "Deductions", flex: 1 },
  {
    field: "actions",
    headerName: "Actions",
    width: 150,
    sortable: false,
    renderCell: (params) => (
      <Box>
        <IconButton
          color="primary"
          size="small"
          onClick={() => alert(`Edit ${params.row.id}`)}
        >
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton
          color="error"
          size="small"
          onClick={() => alert(`Delete ${params.row.id}`)}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
        <IconButton
          color="success"
          size="small"
          onClick={() => alert(`Add for ${params.row.id}`)}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Box>
    ),
  },
];

const rows = [
  {
    id: 1,
    day: "Sun",
    activityType: "Unknown",
    fromDateTime: "27/04/2025 00:23",
    duration: "0d 22:00",
    percentage: "100%",
    toDateTime: "28/04/2025 02:23",
    remarks: "",
    deductions: "0d 22:00",
  },
  {
    id: 2,
    day: "Mon",
    activityType: "Unknown",
    fromDateTime: "28/04/2025 00:23",
    duration: "0d 01:00",
    percentage: "100%",
    toDateTime: "28/04/2025 03:23",
    remarks: "",
    deductions: "0d 01:00",
  },
  {
    id: 3,
    day: "Mon",
    activityType: "Unknown",
    fromDateTime: "28/04/2025 03:23",
    duration: "0d 22:00",
    percentage: "100%",
    toDateTime: "29/04/2025 01:23",
    remarks: "",
    deductions: "0d 22:00",
  },
  {
    id: 4,
    day: "Tue",
    activityType: "Unknown",
    fromDateTime: "29/04/2025 01:23",
    duration: "0d 04:00",
    percentage: "100%",
    toDateTime: "29/04/2025 05:23",
    remarks: "",
    deductions: "0d 04:00",
  },
  {
    id: 5,
    day: "Tue",
    activityType: "Unknown",
    fromDateTime: "29/04/2025 05:23",
    duration: "0d 01:00",
    percentage: "100%",
    toDateTime: "29/04/2025 06:23",
    remarks: "",
    deductions: "0d 01:00",
  },
];

export default function PortActivity({ selectedRow }) {
  return (
    <Card sx={{ m: 2, p: 2, boxShadow: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography sx={{ borderLeft: "5px solid blue", pl: 1 }} variant="h6">
          Port Activity
        </Typography>
        <Button
          disabled={selectedRow === null}
          color="inherit"
          variant="contained"
          startIcon={<AddIcon />}
        >
          Add Item
        </Button>
      </Box>
      <CardContent>
        {selectedRow !== null ? (
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={5}
            sx={{ border: "none" }}
          />
        ) : (
          <Alert sx={{ mt: 1 }} severity="info">
            please select one port to see port activity
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

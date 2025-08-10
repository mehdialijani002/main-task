"use client";

import { useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Alert,
  MenuItem,
  Select,
  TextField,
  Tooltip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import BuildIcon from "@mui/icons-material/Build";
import ConfirmDialog from "@/components/ui/confirmDialog/confirmDialog";
import SnackbarWithProgress from "@/components/ui/snackbar/snackBar";

const activityTypes = [
  "Loading",
  "Unloading",
  "Waiting",
  "Berthing",
  "Unberthing",
  "Inspection",
  "Bunkering",
  "Maintenance",
];

const percentageOptions = ["0%", "50%", "100%"];

function pad(n, len = 2) {
  return String(n).padStart(len, "0");
}

function fmtDurationFromMinutes(totalMin) {
  if (totalMin < 0) totalMin = 0;
  const days = Math.floor(totalMin / (60 * 24));
  const hours = Math.floor((totalMin % (60 * 24)) / 60);
  const mins = totalMin % 60;
  return `${pad(days)}d ${pad(hours)}:${pad(mins)}`;
}

export default function PortActivity({ selectedRow }) {
  const now = dayjs();
  const [firstCreatedId] = useState(1);

  const [rows, setRows] = useState([
    {
      id: 1,
      from: now,
      activityType: "Loading",
      percentage: "100%",
      remarks: "",
      isOutOfOrder: false,
    },
  ]);
  const showMessage = (message, severity = "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    rowId: null,
  });
  const [autoAdjustDialog, setAutoAdjustDialog] = useState({
    open: false,
    rowId: null,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error",
  });
  const handleOpenAutoAdjust = (id) => {
    setAutoAdjustDialog({ open: true, rowId: id });
  };
  const confirmAutoAdjust = () => {
    if (autoAdjustDialog.rowId !== null) {
      autoAdjustRow(autoAdjustDialog.rowId);
    }
    setAutoAdjustDialog({ open: false, rowId: null });
    showMessage("Fixed succefully !", "success");
  };

  const cancelAutoAdjust = () => {
    setAutoAdjustDialog({ open: false, rowId: null });
  };

  const derived = useMemo(() => {
    const mapped = rows.map((r, i) => {
      const to = i < rows.length - 1 ? rows[i + 1].from : r.from;
      const durationMin = Math.max(0, to.diff(r.from, "minute"));
      const percentNum = parseInt(r.percentage || "100");
      const deductionMin = Math.round((durationMin * percentNum) / 100);
      return {
        ...r,
        index: i,
        to,
        durationMin,
        deductionMin,
        dayLabel: r.from.format("ddd"),
        fromDateLabel: r.from.format("DD/MM/YYYY"),
        fromTimeLabel: r.from.format("ddd, HH:mm"),
        toDateLabel: to.format("DD/MM/YYYY"),
        toTimeLabel: to.format("ddd, HH:mm"),
        durationLabel: fmtDurationFromMinutes(durationMin),
        deductionLabel: fmtDurationFromMinutes(deductionMin),
      };
    });

    if (mapped.some((row) => row.isOutOfOrder)) {
      showMessage("Some rows are out of range!", "warning");
    }

    return mapped;
  }, [rows]);

  const handleAddRow = () => {
    setRows((prev) => {
      const maxId = prev.length ? Math.max(...prev.map((r) => r.id)) : 0;
      const newRow = {
        id: maxId + 1,
        from: dayjs(),
        activityType: activityTypes[0],
        percentage: "100%",
        remarks: "",
        isOutOfOrder: false,
      };
      return [...prev, newRow];
    });
  };

  const handleDeleteRow = (id) => setDeleteDialog({ open: true, rowId: id });
  const confirmDelete = () => {
    setRows((prev) => prev.filter((r) => r.id !== deleteDialog.rowId));
    setDeleteDialog({ open: false, rowId: null });
    showMessage("Delete Succefully", "success");
  };
  const closeDeleteDialog = () => setDeleteDialog({ open: false, rowId: null });

  const handleClone = (id) => {
    setRows((prev) => {
      const idx = prev.findIndex((r) => r.id === id);
      if (idx === -1) return prev;
      const maxId = prev.length ? Math.max(...prev.map((r) => r.id)) : 0;
      const original = prev[idx];
      const clone = {
        ...original,
        id: maxId + 1,
        isOutOfOrder: false,
      };
      const newArr = [...prev.slice(0, idx + 1), clone, ...prev.slice(idx + 1)];
      return newArr;
    });
  };

  const handleFromChange = (id, newFrom) => {
    setRows((prev) => {
      const updated = prev.map((r) =>
        r.id === id ? { ...r, from: newFrom } : r
      );
      const sorted = [...updated].sort((a, b) =>
        a.from.isBefore(b.from) ? -1 : 1
      );
      const newIndex = sorted.findIndex((r) => r.id === id);
      const currentIndex = updated.findIndex((r) => r.id === id);
      return updated.map((r, i) =>
        r.id === id ? { ...r, isOutOfOrder: newIndex !== currentIndex } : r
      );
    });
  };

  const handleActivityChange = (id, value) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, activityType: value } : r))
    );
  };

  const handlePercentageChange = (id, value) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, percentage: value } : r))
    );
  };

  const handleRemarksChange = (id, value) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id && r.remarks !== value ? { ...r, remarks: value } : r
      )
    );
  };

  const autoAdjustRow = (id) => {
    setRows((prev) => {
      const target = prev.find((r) => r.id === id);
      if (!target) return prev;
      const others = prev.filter((r) => r.id !== id);
      const merged = [...others, target].sort((a, b) =>
        a.from.isBefore(b.from) ? -1 : 1
      );
      return merged.map((r) => ({ ...r, isOutOfOrder: false }));
    });
  };

  const columns = [
    {
      field: "day",
      headerName: "Day",
      headerClassName: "table-header-background",
      flex: 0.5,
      sortable: false,
      renderCell: (params) => {
        const from = params?.row?.from;
        if (!from) return "-";
        const dayjsFrom = dayjs(from);
        return dayjsFrom.isValid() ? dayjsFrom.format("ddd") : "-";
      },
    },
    {
      field: "activityType",
      headerName: "Activity Type",
      headerClassName: "table-header-background",
      flex: 1.3,
      sortable: false,
      renderCell: (params) => (
        <Select
          size="small"
          value={params.row.activityType}
          onChange={(e) => handleActivityChange(params.row.id, e.target.value)}
        >
          {activityTypes.map((t) => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </Select>
      ),
    },
    {
      field: "fromDateTime",
      headerName: "From Date & Time",
      headerClassName: "table-header-background",
      flex: 2.3,
      sortable: false,
      renderCell: (params) => (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box sx={{ display: "flex", flexDirection: "column", mt: 0.6 }}>
            <DateTimePicker
              value={params.row.from}
              onChange={(newVal) => handleFromChange(params.row.id, newVal)}
              slotProps={{
                textField: {
                  size: "small",
                  sx: { minWidth: 170 },
                },
              }}
            />
          </Box>
        </LocalizationProvider>
      ),
    },
    {
      field: "duration",
      headerName: "Duration",
      headerClassName: "table-header-background",
      flex: 0.9,
      sortable: false,
      renderCell: (params) => {
        if (!params?.row) return null; // <-- guard
        return <div>{fmtDurationFromMinutes(params.row.durationMin)}</div>;
      },
    },
    {
      field: "percentage",
      headerName: "%",
      flex: 1,
      headerClassName: "table-header-background",
      sortable: false,
      renderCell: (params) => (
        <Select
          size="small"
          value={params.row.percentage}
          onChange={(e) =>
            handlePercentageChange(params.row.id, e.target.value)
          }
        >
          {percentageOptions.map((p) => (
            <MenuItem key={p} value={p}>
              {p}
            </MenuItem>
          ))}
        </Select>
      ),
    },
    {
      field: "toDateTime",
      headerName: "To Date Time",
      headerClassName: "table-header-background",
      flex: 1.6,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Typography variant="body2">
            {params.row.to.format("DD/MM/YYYY")}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.to.format("ddd, HH:mm")}
          </Typography>
        </Box>
      ),
    },
    {
      field: "remarks",
      headerName: "Remarks",
      headerClassName: "table-header-background",

      flex: 3,
      sortable: false,
      renderCell: (params) => (
        <TextField
          size="small"
          fullWidth
          sx={{ mt: 0.5 }}
          value={params.row.remarks || ""}
          onChange={(e) => handleRemarksChange(params.row.id, e.target.value)}
        />
      ),
    },
    {
      field: "deductions",
      headerName: "Deductions",
      headerClassName: "table-header-background",

      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <div>{fmtDurationFromMinutes(params.row.deductionMin)}</div>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      headerClassName: "table-header-background",

      flex: 1,
      sortable: false,
      renderCell: (params) => {
        const isFirstCreated = params.row.id === firstCreatedId;
        return (
          <Box>
            <Tooltip title="Delete">
              <IconButton
                color="error"
                size="small"
                onClick={() => handleDeleteRow(params.row.id)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {!isFirstCreated && (
              <Tooltip title="Clone">
                <IconButton
                  color="primary"
                  size="small"
                  onClick={() => handleClone(params.row.id)}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {params.row.isOutOfOrder && (
              <Tooltip title="Auto Adjust">
                <IconButton
                  color="warning"
                  size="small"
                  onClick={() => handleOpenAutoAdjust(params.row.id)}
                >
                  <BuildIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      },
    },
  ];

  return (
    <Card sx={{ m: 2, pt: 3, boxShadow: 3 }}>
      <ConfirmDialog
        open={deleteDialog.open}
        title="Sure to delete?!"
        message="Are you sure you want to delete this row?"
        onCancel={closeDeleteDialog}
        onConfirm={confirmDelete}
        confirmText="Ok"
        cancelText="Cancel"
        confirmColor="error"
      />
      <ConfirmDialog
        open={autoAdjustDialog.open}
        title="Auto Adjust Row"
        message="Do you want to move this row to the correct sorted position?"
        onCancel={cancelAutoAdjust}
        onConfirm={confirmAutoAdjust}
        confirmText="Adjust"
        cancelText="Cancel"
        confirmColor="warning"
      />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
        }}
      >
        <Typography
          sx={{
            borderLeft: "5px solid #00b4d8",
            pl: 1,
            borderRadius: "2px",
          }}
          variant="h6"
        >
          Port Activity
        </Typography>
        <Button
          onClick={handleAddRow}
          color="inherit"
          variant="contained"
          disabled={selectedRow === null}
          startIcon={<AddIcon />}
        >
          Add New
        </Button>
      </Box>

      <CardContent>
        {selectedRow !== null ? (
          <Box
            sx={{
              width: "100%",
              height: "50vh",
              "& .table-header-background": {
                backgroundColor: "#dee2e6",
              },
            }}
          >
            <DataGrid
              rows={derived}
              columns={columns}
              getRowId={(r) => r.id}
              disableRowSelectionOnClick
              pageSize={6}
              rowsPerPageOptions={[6]}
              sx={{
                border: "none",
                "& .MuiDataGrid-virtualScroller": {
                  overflowY: "scroll !important",
                },
                "& .MuiDataGrid-cell": { alignItems: "center" },
                "& .row-out-of-order": {
                  backgroundColor: "#ffa4a4ff !important",
                },
              }}
              getRowClassName={(params) =>
                params.row.isOutOfOrder ? "row-out-of-order" : ""
              }
            />
          </Box>
        ) : (
          <Alert sx={{ mt: 1 }} severity="info">
            please select one port to see port activity
          </Alert>
        )}
      </CardContent>
      <SnackbarWithProgress
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        setSnackbar={setSnackbar}
      />
    </Card>
  );
}

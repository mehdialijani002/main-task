"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Card,
} from "@mui/material";
import { data } from "./data";
import PortActivity from "@/components/portActivity/portActivity";

const HEADERS = [
  "Port Name",
  "Cargo",
  "F",
  "BL Code",
  "Quantity",
  "L/D Rate",
  "Term",
  "Dem Rate/D",
  "Des Rate/D",
  "Allowed",
  "Used",
  "Deduction",
  "Balance",
  "Laycan From",
  "Laycan To",
];

const PortTable = () => {
  const [selectedRow, setSelectedRow] = useState(null);

  return (
    <>
      <Card sx={{ m: 2, p: 0, boxShadow: 2 }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: "lightgray" }}>
              <TableRow>
                {HEADERS.map((header) => (
                  <TableCell key={header}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {header}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {data.map((row, idx) => {
                const isSelected = selectedRow === idx;
                return (
                  <TableRow
                    key={idx}
                    onClick={() => setSelectedRow(idx)}
                    sx={{
                      cursor: "pointer",
                      backgroundColor: isSelected
                        ? "rgba(25, 118, 210, 0.15)"
                        : "transparent",
                      transition: "background-color 0.3s ease",
                      "&:hover": {
                        backgroundColor: isSelected
                          ? "rgba(25, 118, 210, 0.25)"
                          : "rgba(0, 0, 255, 0.05)",
                      },
                    }}
                  >
                    <TableCell>
                      {row.flag} {row.port}
                    </TableCell>
                    <TableCell>{row.cargo}</TableCell>
                    <TableCell>{row.f}</TableCell>
                    <TableCell>{row.blCode}</TableCell>
                    <TableCell>{row.quantity}</TableCell>
                    <TableCell>{row.ldRate}</TableCell>
                    <TableCell>{row.term}</TableCell>
                    <TableCell>{row.demRate}</TableCell>
                    <TableCell>{row.desRate}</TableCell>
                    <TableCell>{row.allowed}</TableCell>
                    <TableCell>{row.used}</TableCell>
                    <TableCell>{row.deduction}</TableCell>
                    <TableCell>{row.balance}</TableCell>
                    <TableCell>{row.laycanFrom}</TableCell>
                    <TableCell>{row.laycanTo}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
      <PortActivity selectedRow={selectedRow} />
    </>
  );
};

export default PortTable;

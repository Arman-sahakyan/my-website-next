"use client";
import { getPermits } from "@/actions/action";
import React, { useEffect, useState } from "react";
import "./AdminTable.css";
import Link from "next/link";
import Loading from "../Loading/Loading";
import { useRouter } from "next/navigation";

const AdminTable = () => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const router = useRouter()
  useEffect(() => {
    getData();
  }, []);

  async function getData() {
    setLoading(true);
    const res:any = await getPermits();
    setData(res);
    setLoading(false);
  }

  function TableContentRenderer() {
    if (loading) {
      return <Loading />;
    }

    return (
      <tbody>
        
        {// @ts-ignore
        data?.map((item:any, key:number) => (
          <tr onClick={()=>router.push(`/admin/${item.id}`)} className="adminTable_row" key={key}>
            <td className="adminTable_row_item">{item.step1.usdot_mc_ccd}</td>
            <td className="adminTable_row_item">{item.step1.email}</td>
            <td className="adminTable_row_item">{item.step1.phone}</td>
            <td className="adminTable_row_item">{item.step1.company_name}</td>
            <td className="adminTable_row_item">
              {item.step1.permit_start_date}
            </td>
            <td className="adminTable_row_item">{item.readyToPay? 'Yes':'No'}</td>
          </tr>
        ))}
      </tbody>
    );
  }

  return (
    <div className="container adminTableContainer">
      <div className="adminControls">
        <Link href="/admin/new">+ New Permit</Link>
        <div onClick={getData} className="refreshBtn">
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z"/></svg>
        </div>
      </div>
      <table className="adminTable">
        <thead>
          <tr>
            <th className="adminTable_head">USDOT</th>
            <th className="adminTable_head">Email</th>
            <th className="adminTable_head">Phone</th>
            <th className="adminTable_head">Company</th>
            <th className="adminTable_head">Start Date</th>
            <th className="adminTable_head">Ready for Pay</th>
          </tr>
        </thead>
        {TableContentRenderer()}
      </table>
    </div>
  );
};

export default AdminTable;

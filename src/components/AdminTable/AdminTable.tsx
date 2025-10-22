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
    const res = await getPermits();
    setData(res);
    setLoading(false);
  }

  function TableContentRenderer() {
    if (loading) {
      return <Loading />;
    }

    return (
      <tbody>
        {data?.map((item:any, key:number) => (
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
    <div className="container">
      <div>
        <Link href="/admin/new">+ New Permit</Link>
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

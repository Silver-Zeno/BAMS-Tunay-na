"use client"

import { useState, useEffect } from "react"
import * as UI from "../components/UI"
import { FileText, Printer, Search, User, Calendar, Download as FileDown } from "lucide-react"

export default function AdminBarangayDocuments() {
  console.log('AdminBarangayDocuments component mounted');
  
  // Log when the component re-renders
  useEffect(() => {
    console.log('AdminBarangayDocuments component rendered');
  });
  const [documents, setDocuments] = useState([
    {
      id: 1,
      documentNumber: "BRGY-2023-001",
      residentName: "Juan Dela Cruz",
      documentType: "Barangay ID",
      issueDate: "2023-11-15",
      expiryDate: "2024-11-15",
      status: "Active",
      purpose: "Valid ID"
    },
    {
      id: 2,
      documentNumber: "BRGY-CERT-2023-045",
      residentName: "Maria Santos",
      documentType: "Barangay Certificate",
      issueDate: "2023-11-10",
      expiryDate: "2023-12-10",
      status: "Active",
      purpose: "School Requirement"
    },
    {
      id: 3,
      documentNumber: "INDG-2023-023",
      residentName: "Pedro Reyes",
      documentType: "Barangay Indigency",
      issueDate: "2023-11-05",
      expiryDate: "2023-12-05",
      status: "Expired",
      purpose: "Medical Assistance"
    },
    {
      id: 4,
      documentNumber: "RES-2023-156",
      residentName: "Ana Martinez",
      documentType: "Proof of Residency",
      issueDate: "2023-11-20",
      expiryDate: "2024-02-20",
      status: "Active",
      purpose: "Bank Transaction"
    }
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("all")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.purpose.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filter === "all" || doc.status.toLowerCase() === filter.toLowerCase()
    
    return matchesSearch && matchesFilter
  })

  const handlePrint = (document) => {
    // In a real app, this would open a print dialog with the document's content
    alert(`Printing document: ${document.documentNumber} (${document.documentType})`)
  }

  const handleDownload = (document) => {
    // In a real app, this would trigger a file download
    alert(`Downloading document: ${document.documentNumber} (${document.documentType})`)
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    
    try {
      // Here you would typically have form data to send
      // For example: const formData = new FormData(e.target);
      
      const response = await fetch('/api/barangay-documents', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming token-based auth
        },
        body: JSON.stringify({
          // Add your form data here
          // Example:
          // documentNumber: formData.get('documentNumber'),
          // residentName: formData.get('residentName'),
          // ... other fields
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save document');
      }
      
      const result = await response.json();
      
      // Update the documents list with the new document
      setDocuments(prevDocs => [result.data, ...prevDocs]);
      
      // Show success message or redirect
      alert('Document saved successfully!');
      
      // Reset form or close modal if you have one
      // handleCloseModal();
      
    } catch (error) {
      console.error('Error saving document:', error);
      setError(error.message || 'An error occurred while saving the document');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      active: "bg-green-100 text-green-800",
      expired: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800"
    }
    
    const statusClass = statusClasses[status.toLowerCase()] || "bg-gray-100 text-gray-800"
    
    return (
      <UI.Badge className={`${statusClass} capitalize`}>
        {status}
      </UI.Badge>
    )
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Barangay Issued Documents</h1>
          <p className="text-slate-600">Manage and track all barangay-issued documents</p>
        </div>

        <UI.Card className="mb-6">
          <UI.CardBody>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by document #, name, or purpose..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-4">
                <select
                  className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="pending">Pending</option>
                </select>
                <UI.Button className="bg-blue-600 hover:bg-blue-700">
                  <FileText className="w-4 h-4 mr-2" />
                  New Document
                </UI.Button>
              </div>
            </div>
          </UI.CardBody>
        </UI.Card>

        <UI.Card>
          <div className="overflow-x-auto">
            <UI.Table>
              <UI.TableHead>
                <UI.TableRow>
                  <UI.TableHeader>Document #</UI.TableHeader>
                  <UI.TableHeader>Resident</UI.TableHeader>
                  <UI.TableHeader>Type</UI.TableHeader>
                  <UI.TableHeader>Issue Date</UI.TableHeader>
                  <UI.TableHeader>Expiry Date</UI.TableHeader>
                  <UI.TableHeader>Status</UI.TableHeader>
                  <UI.TableHeader className="text-right">Actions</UI.TableHeader>
                </UI.TableRow>
              </UI.TableHead>
              <UI.TableBody>
                {filteredDocuments.map((doc) => (
                  <UI.TableRow key={doc.id} className="hover:bg-gray-50">
                    <UI.TableCell className="font-medium text-gray-900">
                      {doc.documentNumber}
                    </UI.TableCell>
                    <UI.TableCell>
                      {doc.residentName}
                    </UI.TableCell>
                    <UI.TableCell>
                      {doc.documentType}
                    </UI.TableCell>
                    <UI.TableCell>
                      {new Date(doc.issueDate).toLocaleDateString()}
                    </UI.TableCell>
                    <UI.TableCell>
                      {new Date(doc.expiryDate).toLocaleDateString()}
                    </UI.TableCell>
                    <UI.TableCell>
                      {getStatusBadge(doc.status)}
                    </UI.TableCell>
                    <UI.TableCell className="text-right">
                      <UI.Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handlePrint(doc)}
                        className="text-blue-600 hover:bg-blue-50"
                      >
                        <Printer className="w-4 h-4 mr-1" /> Print
                      </UI.Button>
                      <UI.Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDownload(doc)}
                        className="text-green-600 hover:bg-green-50"
                      >
                        <FileDown className="w-4 h-4 mr-1" /> Download
                      </UI.Button>
                    </UI.TableCell>
                  </UI.TableRow>
                ))}
              </UI.TableBody>
            </UI.Table>
          </div>
        </UI.Card>
      </div>
    </div>
  )
}

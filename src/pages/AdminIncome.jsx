import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../components/AdminLayout';
import { Row, Col, Card, Table, Alert, Form, Button } from 'react-bootstrap';
import { ArrowUp, ArrowDown, CurrencyDollar, Bag, Download, Calendar } from 'react-bootstrap-icons';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminIncome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [incomeData, setIncomeData] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    revenueGrowth: 0,
    topProducts: [],
    monthlyData: [],
    dailyData: [],
    recentTransactions: []
  });
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    if (!user || user.role !== 'admin') navigate('/');
    else fetchIncomeData();
  }, [user, navigate, selectedPeriod]);

  const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${user?.token}` }
  });

  const fetchIncomeData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/admin/income?period=${selectedPeriod}`, getAuthConfig());
      setIncomeData(response.data);
    } catch (err) {
      console.error('Error fetching income data:', err);
      setError('Failed to fetch income data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatUSD = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount / 80); // Convert INR to USD (approximate rate)
  };

  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  // Debug function to check data structure
  const debugIncomeData = () => {
    console.log('=== INCOME DATA DEBUG ===');
    console.log('Raw incomeData:', incomeData);
    console.log('Type of incomeData:', typeof incomeData);
    console.log('Is array?', Array.isArray(incomeData));
    if (incomeData) {
      console.log('Keys:', Object.keys(incomeData));
      console.log('totalRevenue:', incomeData.totalRevenue);
      console.log('totalOrders:', incomeData.totalOrders);
      console.log('avgOrderValue:', incomeData.avgOrderValue);
      console.log('averageOrderValue:', incomeData.averageOrderValue);
      console.log('monthlyRevenue:', incomeData.monthlyRevenue);
      console.log('revenueGrowth:', incomeData.revenueGrowth);
      console.log('growth:', incomeData.growth);
      console.log('topProducts:', incomeData.topProducts);
      console.log('dailyData:', incomeData.dailyData);
    }
    console.log('=== END DEBUG ===');
  };

  // Chart configuration
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Revenue Trend',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString();
          }
        }
      }
    }
  };

  const dailyChartData = {
    labels: incomeData.dailyData?.map(day => day.date) || [],
    datasets: [
      {
        label: 'Daily Revenue (INR)',
        data: incomeData.dailyData?.map(day => day.revenue) || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1
      }
    ]
  };

  const monthlyChartData = {
    labels: incomeData.monthlyData?.map(month => month.period) || [],
    datasets: [
      {
        label: 'Monthly Revenue (INR)',
        data: incomeData.monthlyData?.map(month => month.revenue) || [],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  };

  const downloadReport = async () => {
    console.log('Download report started');
    
    // Debug the income data first
    debugIncomeData();
    
    if (!incomeData) {
      console.log('No income data available');
      setError('No data available to generate report. Please wait for data to load.');
      return;
    }

    try {
      setLoading(true);
      console.log('Starting PDF generation...');
      
      // Create PDF document
      const doc = new jsPDF();
      console.log('jsPDF document created with autoTable plugin');
      
      const pageWidth = doc.internal.pageSize.width;
      console.log('Page width:', pageWidth);
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text('Pet Store Income Report', pageWidth / 2, 20, { align: 'center' });
      console.log('Header added');
      
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Period: ${selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}`, pageWidth / 2, 30, { align: 'center' });
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 38, { align: 'center' });
      console.log('Subtitle added');
      
      // Summary Section
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text('Revenue Summary', 20, 55);
      console.log('Summary title added');
      
      // Safely extract values with fallbacks
      const totalRevenue = incomeData.totalRevenue || 0;
      const monthlyRevenue = incomeData.monthlyRevenue || totalRevenue;
      const avgOrderValue = incomeData.avgOrderValue || incomeData.averageOrderValue || 0;
      const totalOrders = incomeData.totalOrders || 0;
      const revenueGrowth = incomeData.revenueGrowth || (incomeData.growth ? incomeData.growth.percentage : 0);
      
      console.log('Extracted values:', { totalRevenue, monthlyRevenue, avgOrderValue, totalOrders, revenueGrowth });
      
      const summaryData = [
        ['Metric', 'Value (INR)', 'Value (USD)'],
        ['Total Revenue', formatCurrency(totalRevenue), formatUSD(totalRevenue)],
        ['Monthly Revenue', formatCurrency(monthlyRevenue), formatUSD(monthlyRevenue)],
        ['Average Order Value', formatCurrency(avgOrderValue), formatUSD(avgOrderValue)],
        ['Total Orders', totalOrders.toString(), '-'],
        ['Revenue Growth', formatPercentage(revenueGrowth), '-']
      ];
      console.log('Summary data prepared:', summaryData);

      autoTable(doc, {
        startY: 65,
        head: [summaryData[0]],
        body: summaryData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [63, 81, 181] },
        margin: { left: 20, right: 20 }
      });
      console.log('Summary table added');

      // Top Products Section
      let yPosition = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 120;
      doc.setFontSize(14);
      doc.text('Top Selling Products', 20, yPosition);
      console.log('Top products section started');
      
      if (incomeData.topProducts && Array.isArray(incomeData.topProducts) && incomeData.topProducts.length > 0) {
        const productData = [
          ['Product Name', 'Sales', 'Revenue (INR)', 'Revenue %']
        ];
        
        incomeData.topProducts.slice(0, 5).forEach(product => {
          productData.push([
            product.name || product._id || 'Unknown Product',
            (product.sales || product.count || 0).toString(),
            formatCurrency(product.revenue || 0),
            `${product.percentage || 0}%`
          ]);
        });
        console.log('Product data prepared:', productData);

        autoTable(doc, {
          startY: yPosition + 10,
          head: [productData[0]],
          body: productData.slice(1),
          theme: 'grid',
          headStyles: { fillColor: [76, 175, 80] },
          margin: { left: 20, right: 20 }
        });
        console.log('Products table added');
        yPosition = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : yPosition + 100;
      } else {
        console.log('No top products data available');
        doc.setFontSize(12);
        doc.text('No top products data available', 20, yPosition + 15);
        yPosition += 35;
      }

      // Daily Revenue Section (if available)
      if (incomeData.dailyData && Array.isArray(incomeData.dailyData) && incomeData.dailyData.length > 0) {
        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(14);
        doc.text('Daily Revenue Breakdown', 20, yPosition);
        console.log('Daily data section started');
        
        const dailyDataFormatted = [
          ['Date', 'Revenue (INR)', 'Orders', 'Avg Order Value (INR)']
        ];
        
        incomeData.dailyData.slice(0, 15).forEach(day => {
          dailyDataFormatted.push([
            day.date || day._id || 'N/A',
            formatCurrency(day.revenue || 0),
            (day.orders || day.count || 0).toString(),
            formatCurrency(day.avgOrderValue || day.averageOrderValue || 0)
          ]);
        });
        console.log('Daily data prepared:', dailyDataFormatted);

        autoTable(doc, {
          startY: yPosition + 10,
          head: [dailyDataFormatted[0]],
          body: dailyDataFormatted.slice(1),
          theme: 'grid',
          headStyles: { fillColor: [255, 152, 0] },
          margin: { left: 20, right: 20 }
        });
        console.log('Daily data table added');
      } else {
        console.log('No daily data available');
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        doc.setFontSize(12);
        doc.text('No daily data available for this period', 20, yPosition + 15);
      }

      // Save the PDF
      const fileName = `Pet-Store-Income-Report-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.pdf`;
      console.log('Attempting to save PDF with filename:', fileName);
      
      // Try to save the PDF
      doc.save(fileName);
      console.log('PDF save method called successfully');
      
      // Show success message
      setError('');
      
      // Use a more visible notification
      setTimeout(() => {
        alert('✅ PDF report downloaded successfully! Check your Downloads folder.');
        console.log('Success notification shown');
      }, 100);
      
    } catch (err) {
      console.error('Error generating PDF report:', err);
      console.error('Error details:', err.message);
      console.error('Error stack:', err.stack);
      setError('Failed to generate PDF report: ' + err.message);
      alert('❌ Error generating PDF: ' + err.message);
    } finally {
      setLoading(false);
      console.log('PDF generation process completed');
    }
  };

  return (
    <AdminLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Income Analytics</h2>
        <div className="d-flex gap-2">
          <Form.Select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
            <option value="daily">Last 30 Days (Daily)</option>
          </Form.Select>
          <Button variant="outline-primary" onClick={downloadReport} disabled={loading}>
            <Download className="me-1" />
            Download PDF Report
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Revenue Overview Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="d-flex justify-content-center mb-2">
                <div className="rounded-circle bg-primary bg-opacity-10 p-3">
                  <CurrencyDollar size={24} className="text-primary" />
                </div>
              </div>
              <h4 className="text-primary">{formatCurrency(incomeData.totalRevenue)}</h4>
              <p className="text-muted mb-0">Total Revenue</p>
              <small className="text-muted">{formatUSD(incomeData.totalRevenue)}</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="d-flex justify-content-center mb-2">
                <div className="rounded-circle bg-success bg-opacity-10 p-3">
                  <ArrowUp size={24} className="text-success" />
                </div>
              </div>
              <h4 className="text-success">{formatCurrency(incomeData.monthlyRevenue)}</h4>
              <p className="text-muted mb-0">Monthly Revenue</p>
              <small className={`text-${incomeData.revenueGrowth >= 0 ? 'success' : 'danger'}`}>
                {formatPercentage(incomeData.revenueGrowth)} from last period
              </small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="d-flex justify-content-center mb-2">
                <div className="rounded-circle bg-info bg-opacity-10 p-3">
                  <Bag size={24} className="text-info" />
                </div>
              </div>
              <h4 className="text-info">{incomeData.totalOrders}</h4>
              <p className="text-muted mb-0">Total Orders</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="d-flex justify-content-center mb-2">
                <div className="rounded-circle bg-warning bg-opacity-10 p-3">
                  <ArrowUp size={24} className="text-warning" />
                </div>
              </div>
              <h4 className="text-warning">{formatCurrency(incomeData.averageOrderValue)}</h4>
              <p className="text-muted mb-0">Avg. Order Value</p>
              <small className="text-muted">{formatUSD(incomeData.averageOrderValue)}</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Revenue Charts */}
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Revenue Trend</h5>
            </Card.Header>
            <Card.Body>
              {incomeData.dailyData && incomeData.dailyData.length > 0 ? (
                <div>
                  <div className="mb-4">
                    <h6 className="text-muted mb-3">
                      <Calendar className="me-1" />
                      Daily Revenue Analysis
                    </h6>
                    <Line data={dailyChartData} options={chartOptions} height={100} />
                  </div>
                  
                  {incomeData.monthlyData && incomeData.monthlyData.length > 0 && (
                    <div className="mt-4">
                      <h6 className="text-muted mb-3">Monthly Revenue Comparison</h6>
                      <Bar data={monthlyChartData} options={chartOptions} height={100} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-5 bg-light rounded">
                  <ArrowUp size={48} className="text-muted mb-3" />
                  <h6 className="text-muted">Loading Revenue Charts...</h6>
                  <p className="text-muted mb-0">Interactive charts with Chart.js</p>
                </div>
              )}
              
              {/* Revenue Data Table */}
              {incomeData.dailyData && incomeData.dailyData.length > 0 && (
                <div className="mt-4">
                  <h6>Daily Revenue Data</h6>
                  <Table size="sm" responsive>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Revenue (INR)</th>
                        <th>Revenue (USD)</th>
                        <th>Orders</th>
                        <th>Avg Order Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {incomeData.dailyData.slice(0, 10).map((data, index) => (
                        <tr key={index}>
                          <td>{data.date}</td>
                          <td className="text-success fw-bold">{formatCurrency(data.revenue)}</td>
                          <td className="text-muted">{formatUSD(data.revenue)}</td>
                          <td>{data.orders}</td>
                          <td>{formatCurrency(data.avgOrderValue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
              
              {/* Monthly Revenue Data Table */}
              {incomeData.monthlyData && incomeData.monthlyData.length > 0 && (
                <div className="mt-4">
                  <h6>Period Revenue Data</h6>
                  <Table size="sm" responsive>
                    <thead>
                      <tr>
                        <th>Period</th>
                        <th>Revenue (INR)</th>
                        <th>Revenue (USD)</th>
                        <th>Orders</th>
                        <th>Growth</th>
                      </tr>
                    </thead>
                    <tbody>
                      {incomeData.monthlyData.map((data, index) => (
                        <tr key={index}>
                          <td>{data.period}</td>
                          <td className="text-success fw-bold">{formatCurrency(data.revenue)}</td>
                          <td className="text-muted">{formatUSD(data.revenue)}</td>
                          <td>{data.orders}</td>
                          <td className={`text-${data.growth >= 0 ? 'success' : 'danger'}`}>
                            {formatPercentage(data.growth)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Top Products */}
        <Col md={4}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Top Selling Products</h5>
            </Card.Header>
            <Card.Body>
              {incomeData.topProducts && incomeData.topProducts.length > 0 ? (
                <div>
                  {incomeData.topProducts.map((product, index) => (
                    <div key={index} className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                      <div>
                        <h6 className="mb-1">{product.name}</h6>
                        <small className="text-muted">{product.sales} sales</small>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold">{formatCurrency(product.revenue)}</div>
                        <small className="text-muted">{product.percentage}%</small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted py-4">
                  <Bag size={32} className="mb-2" />
                  <p className="mb-0">No sales data available</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Transactions */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">Recent Transactions</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th>Transaction ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {incomeData.recentTransactions && incomeData.recentTransactions.length > 0 ? (
                incomeData.recentTransactions.map((transaction, index) => (
                  <tr key={index}>
                    <td><code>#{transaction.id}</code></td>
                    <td>{transaction.customer}</td>
                    <td className="fw-bold">{formatCurrency(transaction.amount)}</td>
                    <td>
                      <span className="badge bg-light text-dark">{transaction.paymentMethod}</span>
                    </td>
                    <td>
                      <span className={`badge bg-${transaction.status === 'Completed' ? 'success' : 'warning'}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td>{new Date(transaction.date).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    No recent transactions
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </AdminLayout>
  );
};
export default AdminIncome; 
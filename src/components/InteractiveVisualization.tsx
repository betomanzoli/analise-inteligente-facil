
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TableData {
  headers: string[];
  rows: string[][];
}

interface ChartData {
  name: string;
  value: number;
}

interface InteractiveVisualizationProps {
  content: string;
}

export const InteractiveVisualization: React.FC<InteractiveVisualizationProps> = ({ content }) => {
  // Extract tables from content
  const extractTables = (text: string): TableData[] => {
    const tableRegex = /\|(.+)\|/g;
    const matches = Array.from(text.matchAll(tableRegex));
    
    if (matches.length < 2) return [];
    
    const headers = matches[0][1].split('|').map(h => h.trim()).filter(h => h);
    const rows = matches.slice(2).map(match => 
      match[1].split('|').map(cell => cell.trim()).filter(cell => cell)
    );
    
    return headers.length > 0 && rows.length > 0 ? [{ headers, rows }] : [];
  };

  // Extract numerical data for charts
  const extractChartData = (tables: TableData[]): ChartData[] => {
    if (tables.length === 0) return [];
    
    const table = tables[0];
    return table.rows
      .map(row => {
        const name = row[0];
        const value = parseFloat(row[1]?.replace(/[^\d.-]/g, '') || '0');
        return isNaN(value) ? null : { name, value };
      })
      .filter((item): item is ChartData => item !== null)
      .slice(0, 8); // Limit to 8 items for better visualization
  };

  const tables = extractTables(content);
  const chartData = extractChartData(tables);
  
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0', '#82d982', '#ffb347'];

  return (
    <div className="space-y-6">
      {/* Tables */}
      {tables.map((table, tableIndex) => (
        <Card key={tableIndex}>
          <CardHeader>
            <CardTitle className="text-lg">Tabela {tableIndex + 1}</CardTitle>
            <CardDescription>Dados extraídos do documento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border">
                <thead>
                  <tr className="bg-muted/50">
                    {table.headers.map((header, index) => (
                      <th key={index} className="border border-border p-2 text-left font-medium">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-muted/30">
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="border border-border p-2">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Charts */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Gráfico de Barras</CardTitle>
              <CardDescription>Visualização dos dados numéricos</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    fontSize={12}
                  />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Gráfico de Pizza</CardTitle>
              <CardDescription>Distribuição proporcional dos dados</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Insights dos Dados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">{tables.length}</div>
              <div className="text-sm text-muted-foreground">Tabelas Encontradas</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {tables.reduce((sum, table) => sum + table.rows.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Linhas de Dados</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">{chartData.length}</div>
              <div className="text-sm text-muted-foreground">Pontos de Dados</div>
            </div>
          </div>
          
          {chartData.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Dados Visualizados:</h4>
              <div className="flex flex-wrap gap-2">
                {chartData.map((item, index) => (
                  <Badge key={index} variant="secondary">
                    {item.name}: {item.value}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

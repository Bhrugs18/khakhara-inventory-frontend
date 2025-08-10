import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Package, Factory, Warehouse, AlertTriangle } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface Ingredient {
  id: string
  name: string
  unit: string
  cost_per_unit: number
  supplier?: string
  created_at: string
}

interface ProductionBatch {
  id: string
  batch_number: string
  production_date: string
  start_date: string
  stop_date?: string
  start_time: string
  stop_time?: string
  run_hours?: number
  break_hours?: number
  total_hours?: number
  quantity_produced: number
  ingredients_used: Record<string, number>
  quality_grade: string
  notes?: string
  created_at: string
}

interface InventoryItem {
  id: string
  item_type: string
  item_id: string
  current_stock: number
  minimum_stock: number
  location?: string
  last_updated: string
}

interface DashboardData {
  total_ingredients: number
  total_batches: number
  total_inventory_items: number
  low_stock_count: number
  low_stock_items: InventoryItem[]
  recent_batches: ProductionBatch[]
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [batches, setBatches] = useState<ProductionBatch[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [ingredientsRes, batchesRes, inventoryRes, dashboardRes] = await Promise.all([
        fetch(`${API_URL}/api/ingredients`),
        fetch(`${API_URL}/api/batches`),
        fetch(`${API_URL}/api/inventory`),
        fetch(`${API_URL}/api/dashboard`)
      ])

      if (ingredientsRes.ok) setIngredients(await ingredientsRes.json())
      if (batchesRes.ok) setBatches(await batchesRes.json())
      if (inventoryRes.ok) setInventory(await inventoryRes.json())
      if (dashboardRes.ok) setDashboardData(await dashboardRes.json())
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const addIngredient = async (data: Omit<Ingredient, 'id' | 'created_at'>) => {
    try {
      const response = await fetch(`${API_URL}/api/ingredients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (response.ok) {
        const newIngredient = await response.json()
        setIngredients([...ingredients, newIngredient])
      }
    } catch (error) {
      console.error('Error adding ingredient:', error)
    }
  }

  const addBatch = async (data: Omit<ProductionBatch, 'id' | 'created_at'>) => {
    try {
      const response = await fetch(`${API_URL}/api/batches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (response.ok) {
        const newBatch = await response.json()
        setBatches([...batches, newBatch])
      }
    } catch (error) {
      console.error('Error adding batch:', error)
    }
  }

  const addInventoryItem = async (data: Omit<InventoryItem, 'id' | 'last_updated'>) => {
    try {
      const response = await fetch(`${API_URL}/api/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (response.ok) {
        const newItem = await response.json()
        setInventory([...inventory, newItem])
      }
    } catch (error) {
      console.error('Error adding inventory item:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Khakhara Inventory Management</h1>
              <p className="text-gray-600">Track ingredients, production batches, and stock levels for your khakhara production</p>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Package },
              { id: 'ingredients', label: 'Ingredients', icon: Package },
              { id: 'production', label: 'Production', icon: Factory },
              { id: 'inventory', label: 'Inventory', icon: Warehouse }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <DashboardView dashboardData={dashboardData} />}
        {activeTab === 'ingredients' && <IngredientsView ingredients={ingredients} onAdd={addIngredient} />}
        {activeTab === 'production' && <BatchesView batches={batches} onAdd={addBatch} />}
        {activeTab === 'inventory' && <InventoryView inventory={inventory} ingredients={ingredients} batches={batches} onAdd={addInventoryItem} />}
      </main>
    </div>
  )
}

function DashboardView({ dashboardData }: { dashboardData: DashboardData | null }) {
  if (!dashboardData) {
    return <div>Loading dashboard...</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Ingredients</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.total_ingredients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Factory className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Production Batches</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.total_batches}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Warehouse className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inventory Items</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.total_inventory_items}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.low_stock_count}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Production Batches</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch Number</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead>Quantity (kg)</TableHead>
                <TableHead>Quality Grade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dashboardData.recent_batches.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell className="font-medium">{batch.batch_number}</TableCell>
                  <TableCell>{new Date(batch.start_date).toLocaleDateString()}</TableCell>
                  <TableCell>{batch.start_time}</TableCell>
                  <TableCell>{batch.total_hours || '-'}</TableCell>
                  <TableCell>{batch.quantity_produced}</TableCell>
                  <TableCell>
                    <Badge variant={batch.quality_grade === 'A' ? 'default' : batch.quality_grade === 'B' ? 'secondary' : 'destructive'}>
                      Grade {batch.quality_grade}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function IngredientsView({ ingredients, onAdd }: { 
  ingredients: Ingredient[], 
  onAdd: (data: Omit<Ingredient, 'id' | 'created_at'>) => void 
}) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '', unit: '', cost_per_unit: '', supplier: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd({
      name: formData.name,
      unit: formData.unit,
      cost_per_unit: parseFloat(formData.cost_per_unit),
      supplier: formData.supplier || undefined
    })
    setFormData({ name: '', unit: '', cost_per_unit: '', supplier: '' })
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Ingredients</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Ingredient
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Ingredient</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="kg, grams, liters"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cost">Cost per Unit</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={formData.cost_per_unit}
                    onChange={(e) => setFormData({ ...formData, cost_per_unit: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="supplier">Supplier</Label>
                  <Input
                    id="supplier"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Add Ingredient</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Cost per Unit</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ingredients.map((ingredient) => (
                <TableRow key={ingredient.id}>
                  <TableCell className="font-medium">{ingredient.name}</TableCell>
                  <TableCell>{ingredient.unit}</TableCell>
                  <TableCell>₹{ingredient.cost_per_unit}</TableCell>
                  <TableCell>{ingredient.supplier || '-'}</TableCell>
                  <TableCell>{new Date(ingredient.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function BatchesView({ batches, onAdd }: { 
  batches: ProductionBatch[], 
  onAdd: (data: Omit<ProductionBatch, 'id' | 'created_at'>) => void 
}){
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    batch_number: '',
    production_date: '',
    start_date: '',
    stop_date: '',
    start_time: '',
    stop_time: '',
    run_hours: '',
    break_hours: '',
    total_hours: '',
    quantity_produced: '',
    quality_grade: '',
    notes: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd({
      batch_number: formData.batch_number,
      production_date: formData.production_date,
      start_date: formData.start_date,
      stop_date: formData.stop_date || undefined,
      start_time: formData.start_time,
      stop_time: formData.stop_time || undefined,
      run_hours: formData.run_hours ? parseFloat(formData.run_hours) : undefined,
      break_hours: formData.break_hours ? parseFloat(formData.break_hours) : undefined,
      total_hours: formData.total_hours ? parseFloat(formData.total_hours) : undefined,
      quantity_produced: parseFloat(formData.quantity_produced),
      ingredients_used: {},
      quality_grade: formData.quality_grade,
      notes: formData.notes || undefined
    })
    setFormData({ 
      batch_number: '', production_date: '', start_date: '', stop_date: '', 
      start_time: '', stop_time: '', run_hours: '', break_hours: '', 
      total_hours: '', quantity_produced: '', quality_grade: '', notes: '' 
    })
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Production Batches</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Batch
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Production Batch</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="batch_number">Batch Number</Label>
                  <Input
                    id="batch_number"
                    value={formData.batch_number}
                    onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="production_date">Production Date</Label>
                  <Input
                    id="production_date"
                    type="date"
                    value={formData.production_date}
                    onChange={(e) => setFormData({ ...formData, production_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="stop_date">Stop Date (Optional)</Label>
                  <Input
                    id="stop_date"
                    type="date"
                    value={formData.stop_date}
                    onChange={(e) => setFormData({ ...formData, stop_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="stop_time">Stop Time (Optional)</Label>
                  <Input
                    id="stop_time"
                    type="time"
                    value={formData.stop_time}
                    onChange={(e) => setFormData({ ...formData, stop_time: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="run_hours">Run Hours (Optional)</Label>
                  <Input
                    id="run_hours"
                    type="number"
                    step="0.1"
                    value={formData.run_hours}
                    onChange={(e) => setFormData({ ...formData, run_hours: e.target.value })}
                    placeholder="e.g. 8.5"
                  />
                </div>
                <div>
                  <Label htmlFor="break_hours">Break Hours (Optional)</Label>
                  <Input
                    id="break_hours"
                    type="number"
                    step="0.1"
                    value={formData.break_hours}
                    onChange={(e) => setFormData({ ...formData, break_hours: e.target.value })}
                    placeholder="e.g. 1.0"
                  />
                </div>
                <div>
                  <Label htmlFor="total_hours">Total Hours (Optional)</Label>
                  <Input
                    id="total_hours"
                    type="number"
                    step="0.1"
                    value={formData.total_hours}
                    onChange={(e) => setFormData({ ...formData, total_hours: e.target.value })}
                    placeholder="e.g. 9.5"
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity Produced (kg)</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    value={formData.quantity_produced}
                    onChange={(e) => setFormData({ ...formData, quantity_produced: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="quality_grade">Quality Grade</Label>
                  <Select value={formData.quality_grade} onValueChange={(value) => setFormData({ ...formData, quality_grade: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Grade A</SelectItem>
                      <SelectItem value="B">Grade B</SelectItem>
                      <SelectItem value="C">Grade C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional production notes..."
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Add Batch</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch Number</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead>Quantity (kg)</TableHead>
                <TableHead>Quality Grade</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell className="font-medium">{batch.batch_number}</TableCell>
                  <TableCell>{new Date(batch.start_date).toLocaleDateString()}</TableCell>
                  <TableCell>{batch.start_time}</TableCell>
                  <TableCell>{batch.total_hours || '-'}</TableCell>
                  <TableCell>{batch.quantity_produced}</TableCell>
                  <TableCell>
                    <Badge variant={batch.quality_grade === 'A' ? 'default' : batch.quality_grade === 'B' ? 'secondary' : 'destructive'}>
                      Grade {batch.quality_grade}
                    </Badge>
                  </TableCell>
                  <TableCell>{batch.notes || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function InventoryView({ inventory, ingredients, batches, onAdd }: { 
  inventory: InventoryItem[], 
  ingredients: Ingredient[], 
  batches: ProductionBatch[], 
  onAdd: (data: Omit<InventoryItem, 'id' | 'last_updated'>) => void 
}) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    item_type: '',
    item_id: '',
    current_stock: '',
    minimum_stock: '',
    location: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd({
      item_type: formData.item_type,
      item_id: formData.item_id,
      current_stock: parseFloat(formData.current_stock),
      minimum_stock: parseFloat(formData.minimum_stock),
      location: formData.location || undefined
    })
    setFormData({ item_type: '', item_id: '', current_stock: '', minimum_stock: '', location: '' })
    setShowForm(false)
  }

  const getItemName = (item: InventoryItem) => {
    if (item.item_type === 'ingredient') {
      const ingredient = ingredients.find(i => i.id === item.item_id)
      return ingredient ? ingredient.name : 'Unknown Ingredient'
    } else {
      const batch = batches.find(b => b.id === item.item_id)
      return batch ? `Batch ${batch.batch_number}` : 'Unknown Batch'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Inventory</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Inventory Item
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Inventory Item</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="item_type">Item Type</Label>
                  <Select value={formData.item_type} onValueChange={(value) => setFormData({ ...formData, item_type: value, item_id: '' })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ingredient">Ingredient</SelectItem>
                      <SelectItem value="finished_product">Finished Product</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="item_id">Item</Label>
                  <Select value={formData.item_id} onValueChange={(value) => setFormData({ ...formData, item_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select item" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.item_type === 'ingredient' && ingredients.map(ingredient => (
                        <SelectItem key={ingredient.id} value={ingredient.id}>{ingredient.name}</SelectItem>
                      ))}
                      {formData.item_type === 'finished_product' && batches.map(batch => (
                        <SelectItem key={batch.id} value={batch.id}>Batch {batch.batch_number}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="current_stock">Current Stock</Label>
                  <Input
                    id="current_stock"
                    type="number"
                    step="0.01"
                    value={formData.current_stock}
                    onChange={(e) => setFormData({ ...formData, current_stock: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="minimum_stock">Minimum Stock</Label>
                  <Input
                    id="minimum_stock"
                    type="number"
                    step="0.01"
                    value={formData.minimum_stock}
                    onChange={(e) => setFormData({ ...formData, minimum_stock: e.target.value })}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Storage location"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Add Inventory Item</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Minimum Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{getItemName(item)}</TableCell>
                  <TableCell className="capitalize">{item.item_type.replace('_', ' ')}</TableCell>
                  <TableCell>{item.current_stock}</TableCell>
                  <TableCell>{item.minimum_stock}</TableCell>
                  <TableCell>
                    {item.current_stock <= item.minimum_stock ? (
                      <Badge variant="destructive">Low Stock</Badge>
                    ) : (
                      <Badge variant="default">In Stock</Badge>
                    )}
                  </TableCell>
                  <TableCell>{item.location || '-'}</TableCell>
                  <TableCell>{new Date(item.last_updated).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default App

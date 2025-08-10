import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Package, Factory, BarChart3, AlertTriangle } from 'lucide-react'

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
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [batches, setBatches] = useState<ProductionBatch[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [activeTab, setActiveTab] = useState('dashboard')

  const fetchData = async () => {
    try {
      const [ingredientsRes, batchesRes, inventoryRes, dashboardRes] = await Promise.all([
        fetch(`${API_URL}/api/ingredients`),
        fetch(`${API_URL}/api/batches`),
        fetch(`${API_URL}/api/inventory`),
        fetch(`${API_URL}/api/dashboard`)
      ])

      setIngredients(await ingredientsRes.json())
      setBatches(await batchesRes.json())
      setInventory(await inventoryRes.json())
      setDashboard(await dashboardRes.json())
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const addIngredient = async (data: Omit<Ingredient, 'id' | 'created_at'>) => {
    try {
      const response = await fetch(`${API_URL}/api/ingredients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (response.ok) {
        fetchData()
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
        fetchData()
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
        fetchData()
      }
    } catch (error) {
      console.error('Error adding inventory item:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Khakhara Inventory Management</h1>
          <p className="text-gray-600">Track ingredients, production batches, and stock levels for your khakhara production</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="ingredients" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Ingredients
            </TabsTrigger>
            <TabsTrigger value="batches" className="flex items-center gap-2">
              <Factory className="w-4 h-4" />
              Production
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Inventory
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardView dashboard={dashboard} />
          </TabsContent>

          <TabsContent value="ingredients">
            <IngredientsView ingredients={ingredients} onAdd={addIngredient} />
          </TabsContent>

          <TabsContent value="batches">
            <BatchesView batches={batches} onAdd={addBatch} />
          </TabsContent>

          <TabsContent value="inventory">
            <InventoryView inventory={inventory} ingredients={ingredients} batches={batches} onAdd={addInventoryItem} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function DashboardView({ dashboard }: { dashboard: DashboardData | null }) {
  if (!dashboard) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Ingredients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.total_ingredients}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Production Batches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.total_batches}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Inventory Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.total_inventory_items}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{dashboard.low_stock_count}</div>
          </CardContent>
        </Card>
      </div>

      {dashboard.low_stock_count > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have {dashboard.low_stock_count} items running low on stock. Check the inventory tab for details.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Production Batches</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch Number</TableHead>
                <TableHead>Production Date</TableHead>
                <TableHead>Quantity (kg)</TableHead>
                <TableHead>Quality Grade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dashboard.recent_batches.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell>{batch.batch_number}</TableCell>
                  <TableCell>{new Date(batch.production_date).toLocaleDateString()}</TableCell>
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

function IngredientsView({ ingredients, onAdd }: { ingredients: Ingredient[], onAdd: (data: Omit<Ingredient, 'id' | 'created_at'>) => void }) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    unit: '',
    cost_per_unit: '',
    supplier: ''
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
                    placeholder="kg, grams, liters, etc."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cost">Cost per Unit (₹)</Label>
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
                <TableHead>Cost per Unit (₹)</TableHead>
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
    quantity_produced: '',
    quality_grade: '',
    notes: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd({
      batch_number: formData.batch_number,
      production_date: formData.production_date,
      quantity_produced: parseFloat(formData.quantity_produced),
      ingredients_used: {},
      quality_grade: formData.quality_grade,
      notes: formData.notes || undefined
    })
    setFormData({ batch_number: '', production_date: '', quantity_produced: '', quality_grade: '', notes: '' })
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
                <TableHead>Production Date</TableHead>
                <TableHead>Quantity (kg)</TableHead>
                <TableHead>Quality Grade</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell className="font-medium">{batch.batch_number}</TableCell>
                  <TableCell>{new Date(batch.production_date).toLocaleDateString()}</TableCell>
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

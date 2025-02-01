import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/../firebaseConfig';
import Layout from '@/pages/layout';

const INITIAL_BUDGET = 1000000; // 100万円

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [remainingBudget, setRemainingBudget] = useState(INITIAL_BUDGET);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const categories = [
    'サーバー費用',
    '開発費',
    'マーケティング',
    'デザイン',
    'その他',
  ];

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const q = query(collection(db, 'expenses'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const expensesList = [];
      let totalExpenses = 0;

      querySnapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() };
        expensesList.push(data);
        totalExpenses += data.amount;
      });

      setExpenses(expensesList);
      setRemainingBudget(INITIAL_BUDGET - totalExpenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !description || !category) return;

    try {
      await addDoc(collection(db, 'expenses'), {
        amount: Number(amount),
        description,
        category,
        createdAt: new Date(),
      });

      setAmount('');
      setDescription('');
      setCategory('');
      fetchExpenses();
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setAmount(expense.amount.toString());
    setDescription(expense.description);
    setCategory(expense.category);
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!amount || !description || !category) return;

    try {
      const expenseRef = doc(db, 'expenses', editingExpense.id);
      await updateDoc(expenseRef, {
        amount: Number(amount),
        description,
        category,
        updatedAt: new Date(),
      });

      setEditDialogOpen(false);
      setEditingExpense(null);
      setAmount('');
      setDescription('');
      setCategory('');
      fetchExpenses();
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('本当に削除しますか？')) return;

    try {
      await deleteDoc(doc(db, 'expenses', id));
      fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            経費管理
          </Typography>

          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" color="primary" gutterBottom>
              残高: ¥{remainingBudget.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              初期予算: ¥{INITIAL_BUDGET.toLocaleString()}
            </Typography>
          </Paper>

          <Paper sx={{ p: 3, mb: 4 }}>
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                  label="金額"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  sx={{ flex: 1 }}
                />
                <FormControl sx={{ flex: 1 }}>
                  <InputLabel>カテゴリ</InputLabel>
                  <Select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    label="カテゴリ"
                    required
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="説明"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  sx={{ flex: 2 }}
                />
                <Button type="submit" variant="contained">
                  追加
                </Button>
              </Box>
            </form>
          </Paper>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>日付</TableCell>
                  <TableCell>カテゴリ</TableCell>
                  <TableCell>説明</TableCell>
                  <TableCell align="right">金額</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      {expense.createdAt.toDate().toLocaleDateString('ja-JP')}
                    </TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell align="right">
                      ¥{expense.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEdit(expense)} size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(expense.id)} size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
            <DialogTitle>経費を編集</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <TextField
                  label="金額"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
                <FormControl>
                  <InputLabel>カテゴリ</InputLabel>
                  <Select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    label="カテゴリ"
                    required
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="説明"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditDialogOpen(false)}>キャンセル</Button>
              <Button onClick={handleUpdate} variant="contained">
                更新
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Container>
    </Layout>
  );
};

export default ExpensesPage; 
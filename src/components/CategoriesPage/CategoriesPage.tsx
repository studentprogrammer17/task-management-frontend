import React, { useEffect, useState } from 'react';
import { Category } from '../../models/Category';
import { CategoryService } from '../../services/category.service';
import CategoryForm from './CategoryForm';
import CategoriesTasks from './CategoriesTasks';
import ConfirmationDialog from '../Common/ConfirmationDialog';
import './CategoriesPage.css';

interface CategoriesPageProps {
  isAdmin: boolean;
}

const CategoriesPage: React.FC<CategoriesPageProps> = ({ isAdmin }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [tasksByCategory, setTasksByCategory] = useState<Record<string, any[]>>(
    {}
  );
  const [error, setError] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    categoryId: string | null;
    categoryName: string;
  }>({
    isOpen: false,
    categoryId: null,
    categoryName: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await CategoryService.getAllCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError('Error fetching categories.');
      console.error(err);
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteConfirmation({
      isOpen: true,
      categoryId: id,
      categoryName: name,
    });
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmation.categoryId) {
      try {
        await CategoryService.deleteCategory(deleteConfirmation.categoryId);
        fetchCategories();
      } catch (err: any) {
        const message = err?.response?.data?.error || 'Delete failed';
        if (
          message.includes(
            'Category cant be delete because it has related tasks'
          )
        ) {
          setError('Cannot delete category: it has related tasks.');
        } else {
          setError('Failed to delete category. Please try again.');
        }
      }
      setDeleteConfirmation({
        isOpen: false,
        categoryId: null,
        categoryName: '',
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({
      isOpen: false,
      categoryId: null,
      categoryName: '',
    });
  };

  const handleShowTasks = async (id: string) => {
    if (tasksByCategory[id]) {
      setTasksByCategory(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    } else {
      try {
        const tasks = await CategoryService.getTasksByCategoryId(id);
        setTasksByCategory(prev => ({ ...prev, [id]: tasks }));
      } catch (err) {
        setError('Failed to load tasks for this category.');
      }
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory({ id: category.id, name: category.name });
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
  };

  return (
    <div className="categories-page container mt-4">
      <h2>Categories</h2>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
          <button
            type="button"
            className="btn-close float-end"
            onClick={() => setError(null)}
          ></button>
        </div>
      )}
      {isAdmin && (
        <CategoryForm
          onCategoryCreated={fetchCategories}
          editingCategory={editingCategory}
          onCancelEdit={handleCancelEdit}
        />
      )}

      <ul className="list-group mt-3">
        {categories.map(category => (
          <li key={category.id} className="list-group-item">
            <div className="d-flex justify-content-between align-items-center">
              <strong>{category.name}</strong>
              <div>
                <button
                  className="btn btn-info btn-sm mx-1"
                  onClick={() => handleShowTasks(category.id)}
                >
                  {tasksByCategory[category.id] ? 'Hide Tasks' : 'Show Tasks'}
                </button>
                {isAdmin && (
                  <>
                    <button
                      className="btn btn-warning btn-sm mx-1"
                      onClick={() => handleEdit(category)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm mx-1"
                      onClick={() =>
                        handleDeleteClick(category.id, category.name)
                      }
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
            {tasksByCategory[category.id] && (
              <div className="mt-2">
                <CategoriesTasks tasks={tasksByCategory[category.id]} />
              </div>
            )}
          </li>
        ))}
      </ul>

      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteConfirmation.categoryName}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
};

export default CategoriesPage;

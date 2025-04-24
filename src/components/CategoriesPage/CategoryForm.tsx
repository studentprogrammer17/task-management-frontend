import React, { useState, useEffect } from 'react';
import { CategoryService } from '../../services/category.service';

interface Props {
  onCategoryCreated: () => void;
  editingCategory?: { id: string; name: string } | null;
  onCancelEdit?: () => void;
}

const CategoryForm: React.FC<Props> = ({
  onCategoryCreated,
  editingCategory,
  onCancelEdit,
}) => {
  const [name, setName] = useState(editingCategory?.name || '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(editingCategory?.name || '');
  }, [editingCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      if (editingCategory) {
        await CategoryService.updateCategory(editingCategory.id, { name });
      } else {
        await CategoryService.createCategory({ name });
      }
      setName('');
      setError(null);
      onCategoryCreated();
      if (onCancelEdit) onCancelEdit();
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Unexpected error';
      if (message.includes('Such category already exists')) {
        setError('Such category already exists.');
      } else {
        setError('Failed to save category. Please try again.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="d-flex flex-column mt-2">
      <div className="d-flex">
        <input
          className="form-control me-2"
          type="text"
          placeholder={editingCategory ? 'Edit category name' : 'Category name'}
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <button className="btn btn-success" type="submit">
          {editingCategory ? 'Update' : 'Add'}
        </button>
        {editingCategory && (
          <button
            className="btn btn-secondary ms-2"
            onClick={onCancelEdit}
            type="button"
          >
            Cancel
          </button>
        )}
      </div>
      {error && <div className="text-danger mt-2">{error}</div>}
    </form>
  );
};

export default CategoryForm;

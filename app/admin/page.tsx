'use client';

import { useState, useEffect } from 'react';

const API_BASE = '/api';

interface PageSection {
  id: string;
  section_key: string;
  section_type: string;
  title: string;
  content: any;
}

interface MenuItem {
  id: number;
  label: string;
  url: string;
  page_slug: string | null;
  order_index: number;
  is_active: boolean;
  item_type: 'menu' | 'cta';
}

interface QuickLink {
  label: string;
  url: string;
}

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Page content state
  const [pageContent, setPageContent] = useState<any>(null);
  const [sectionKey, setSectionKey] = useState<string>('');
  const [boardImage, setBoardImage] = useState('');
  const [boardDescription, setBoardDescription] = useState('');

  // Menu items state
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [editingMenuId, setEditingMenuId] = useState<number | null>(null);
  const [editingMenuData, setEditingMenuData] = useState({ label: '', url: '', is_active: true });
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [newMenuItem, setNewMenuItem] = useState({ label: '', url: '', item_type: 'menu' as 'menu' | 'cta' });

  // Footer quick links state
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([]);
  const [editingLinkIndex, setEditingLinkIndex] = useState<number | null>(null);
  const [showAddLink, setShowAddLink] = useState(false);
  const [newLink, setNewLink] = useState({ label: '', url: '' });
  const [footerDirty, setFooterDirty] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchPageContent(), fetchMenuItems(), fetchFooterConfig()]);
    setLoading(false);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const fetchPageContent = async () => {
    try {
      const response = await fetch(`${API_BASE}/pages/about`);
      if (!response.ok) throw new Error('Failed to fetch page');

      const data = await response.json();
      if (data && data.sections) {
        const pageContentSection = data.sections.find(
          (s: PageSection) => s.section_type === 'page_content'
        );
        if (pageContentSection) {
          setPageContent(pageContentSection.content);
          setSectionKey(pageContentSection.section_key);
          setBoardImage(pageContentSection.content?.boardImage || '');
          setBoardDescription(pageContentSection.content?.boardDescription || '');
        }
      }
    } catch (error) {
      console.error('Error fetching page:', error);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await fetch(`${API_BASE}/menu-items?includeInactive=true`);
      if (response.ok) {
        const data = await response.json();
        setMenuItems(data.sort((a: MenuItem, b: MenuItem) => {
          if (a.item_type !== b.item_type) return a.item_type === 'menu' ? -1 : 1;
          return a.order_index - b.order_index;
        }));
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const fetchFooterConfig = async () => {
    try {
      const response = await fetch(`${API_BASE}/footer-config`);
      if (response.ok) {
        const data = await response.json();
        setQuickLinks(data.quick_links || []);
        setFooterDirty(false);
      }
    } catch (error) {
      console.error('Error fetching footer config:', error);
    }
  };

  // Menu item functions
  const moveMenuItem = async (itemId: number, direction: 'up' | 'down') => {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;

    const sameTypeItems = menuItems.filter(i => i.item_type === item.item_type);
    const itemIndex = sameTypeItems.findIndex(i => i.id === itemId);

    if (direction === 'up' && itemIndex === 0) return;
    if (direction === 'down' && itemIndex === sameTypeItems.length - 1) return;

    const newItems = [...sameTypeItems];
    const swapIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
    [newItems[itemIndex], newItems[swapIndex]] = [newItems[swapIndex], newItems[itemIndex]];

    const reorderedItems = newItems.map((item, idx) => ({ ...item, order_index: idx }));

    // Update state
    const otherTypeItems = menuItems.filter(i => i.item_type !== item.item_type);
    setMenuItems(item.item_type === 'menu'
      ? [...reorderedItems, ...otherTypeItems]
      : [...otherTypeItems, ...reorderedItems]
    );

    // Save to backend
    try {
      setSaving(true);
      const response = await fetch(`${API_BASE}/menu-items/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: reorderedItems.map(i => ({ id: i.id, order_index: i.order_index }))
        })
      });

      if (response.ok) {
        showMessage('success', 'Menu order updated!');
      } else {
        throw new Error('Failed to save order');
      }
    } catch (error) {
      showMessage('error', 'Failed to save menu order');
      fetchMenuItems();
    } finally {
      setSaving(false);
    }
  };

  const startEditMenuItem = (item: MenuItem) => {
    setEditingMenuId(item.id);
    setEditingMenuData({ label: item.label, url: item.url, is_active: item.is_active });
  };

  const saveMenuItem = async () => {
    if (!editingMenuId) return;

    try {
      setSaving(true);
      const response = await fetch(`${API_BASE}/menu-items/${editingMenuId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingMenuData)
      });

      if (response.ok) {
        showMessage('success', 'Menu item updated!');
        setEditingMenuId(null);
        fetchMenuItems();
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      showMessage('error', 'Failed to update menu item');
    } finally {
      setSaving(false);
    }
  };

  const addMenuItem = async () => {
    if (!newMenuItem.label || !newMenuItem.url) {
      showMessage('error', 'Label and URL are required');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`${API_BASE}/menu-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newMenuItem,
          order_index: menuItems.filter(i => i.item_type === newMenuItem.item_type).length
        })
      });

      if (response.ok) {
        showMessage('success', 'Menu item added!');
        setNewMenuItem({ label: '', url: '', item_type: 'menu' });
        setShowAddMenu(false);
        fetchMenuItems();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add');
      }
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to add menu item');
    } finally {
      setSaving(false);
    }
  };

  const deleteMenuItem = async (id: number) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
      setSaving(true);
      const response = await fetch(`${API_BASE}/menu-items/${id}`, { method: 'DELETE' });

      if (response.ok) {
        showMessage('success', 'Menu item deleted!');
        fetchMenuItems();
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      showMessage('error', 'Failed to delete menu item');
    } finally {
      setSaving(false);
    }
  };

  // Footer quick links functions
  const moveQuickLink = (index: number, direction: 'up' | 'down') => {
    const links = [...quickLinks];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= links.length) return;
    [links[index], links[swapIndex]] = [links[swapIndex], links[index]];
    setQuickLinks(links);
    setFooterDirty(true);
  };

  const updateQuickLink = (index: number, field: 'label' | 'url', value: string) => {
    const links = [...quickLinks];
    links[index] = { ...links[index], [field]: value };
    setQuickLinks(links);
    setFooterDirty(true);
  };

  const deleteQuickLink = (index: number) => {
    setQuickLinks(quickLinks.filter((_, i) => i !== index));
    setFooterDirty(true);
  };

  const addQuickLink = () => {
    if (!newLink.label || !newLink.url) {
      showMessage('error', 'Label and URL are required');
      return;
    }
    setQuickLinks([...quickLinks, newLink]);
    setNewLink({ label: '', url: '' });
    setShowAddLink(false);
    setFooterDirty(true);
  };

  const saveQuickLinks = async () => {
    try {
      setSaving(true);
      const getResponse = await fetch(`${API_BASE}/footer-config`);
      if (!getResponse.ok) throw new Error('Failed to get footer config');
      const currentConfig = await getResponse.json();

      const response = await fetch(`${API_BASE}/footer-config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...currentConfig, quick_links: quickLinks })
      });

      if (response.ok) {
        showMessage('success', 'Footer quick links saved!');
        setFooterDirty(false);
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      showMessage('error', 'Failed to save quick links');
    } finally {
      setSaving(false);
    }
  };

  // Board of Directors save
  const saveBoardContent = async () => {
    if (!sectionKey) {
      showMessage('error', 'Page content section not found');
      return;
    }

    try {
      setSaving(true);
      const updatedContent = { ...pageContent, boardImage, boardDescription };

      const response = await fetch(`${API_BASE}/pages/about/sections/${sectionKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: updatedContent })
      });

      if (!response.ok) throw new Error('Failed to save');

      showMessage('success', 'Board of Directors content saved!');
      setPageContent(updatedContent);
    } catch (error) {
      showMessage('error', 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor: '#f3f4f6'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #2a3f75',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#6b7280' }}>Loading site settings...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  const menuOnlyItems = menuItems.filter(i => i.item_type === 'menu');
  const ctaItems = menuItems.filter(i => i.item_type === 'cta');

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden' as const,
    marginBottom: '24px'
  };

  const cardHeaderStyle = (color: string) => ({
    background: `linear-gradient(135deg, ${color}15 0%, ${color}25 100%)`,
    padding: '16px 20px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  });

  const buttonStyle = (color: string, disabled?: boolean) => ({
    backgroundColor: disabled ? '#9ca3af' : color,
    color: 'white',
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '500' as const,
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  });

  const inputStyle = {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px'
  };

  const arrowBtnStyle = (disabled: boolean) => ({
    padding: '4px',
    border: 'none',
    backgroundColor: disabled ? 'transparent' : '#f3f4f6',
    borderRadius: '4px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.3 : 1
  });

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#2a3f75',
        color: 'white',
        padding: '16px 24px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>GETFund CMS Admin</h1>
        <p style={{ margin: '4px 0 0', opacity: 0.8, fontSize: '14px' }}>Site Management</p>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Status Message */}
        {message && (
          <div style={{
            marginBottom: '24px',
            padding: '16px',
            borderRadius: '8px',
            backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: message.type === 'success' ? '#166534' : '#991b1b',
            border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`
          }}>
            {message.text}
          </div>
        )}

        {/* Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>

          {/* Navigation Menu Card */}
          <div style={cardStyle}>
            <div style={cardHeaderStyle('#3b82f6')}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1e40af' }}>Navigation Menu</h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>Reorder and manage menu items</p>
              </div>
              <button
                onClick={() => { setShowAddMenu(true); setNewMenuItem({ ...newMenuItem, item_type: 'menu' }); }}
                style={buttonStyle('#3b82f6')}
              >
                + Add
              </button>
            </div>

            <div style={{ padding: '16px', maxHeight: '400px', overflowY: 'auto' }}>
              {/* Main Menu */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Main Menu</h4>
                {menuOnlyItems.map((item, index) => (
                  <div key={item.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    marginBottom: '8px',
                    backgroundColor: item.is_active ? '#fff' : '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    opacity: item.is_active ? 1 : 0.6
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <button onClick={() => moveMenuItem(item.id, 'up')} disabled={index === 0} style={arrowBtnStyle(index === 0)}>▲</button>
                      <button onClick={() => moveMenuItem(item.id, 'down')} disabled={index === menuOnlyItems.length - 1} style={arrowBtnStyle(index === menuOnlyItems.length - 1)}>▼</button>
                    </div>

                    {editingMenuId === item.id ? (
                      <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={editingMenuData.label}
                          onChange={(e) => setEditingMenuData({ ...editingMenuData, label: e.target.value })}
                          style={{ ...inputStyle, width: '120px' }}
                          placeholder="Label"
                        />
                        <input
                          type="text"
                          value={editingMenuData.url}
                          onChange={(e) => setEditingMenuData({ ...editingMenuData, url: e.target.value })}
                          style={{ ...inputStyle, flex: 1, minWidth: '100px' }}
                          placeholder="URL"
                        />
                        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                          <input
                            type="checkbox"
                            checked={editingMenuData.is_active}
                            onChange={(e) => setEditingMenuData({ ...editingMenuData, is_active: e.target.checked })}
                          />
                          Active
                        </label>
                        <button onClick={saveMenuItem} style={{ ...buttonStyle('#22c55e'), padding: '6px 12px' }}>Save</button>
                        <button onClick={() => setEditingMenuId(null)} style={{ ...buttonStyle('#6b7280'), padding: '6px 12px' }}>Cancel</button>
                      </div>
                    ) : (
                      <>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: '500', fontSize: '14px', color: '#111827' }}>{item.label}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.url}</div>
                        </div>
                        {!item.is_active && <span style={{ fontSize: '11px', padding: '2px 6px', backgroundColor: '#f3f4f6', color: '#6b7280', borderRadius: '4px' }}>Inactive</span>}
                        <button onClick={() => startEditMenuItem(item)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', color: '#6b7280' }}>✏️</button>
                        <button onClick={() => deleteMenuItem(item.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', color: '#ef4444' }}>🗑️</button>
                      </>
                    )}
                  </div>
                ))}
                {menuOnlyItems.length === 0 && <p style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>No menu items yet</p>}
              </div>

              {/* CTA Buttons */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>CTA Buttons</h4>
                  {ctaItems.length < 2 && (
                    <button onClick={() => { setShowAddMenu(true); setNewMenuItem({ ...newMenuItem, item_type: 'cta' }); }} style={{ fontSize: '12px', color: '#f59e0b', background: 'none', border: 'none', cursor: 'pointer' }}>+ Add CTA</button>
                  )}
                </div>
                {ctaItems.map((item, index) => (
                  <div key={item.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    marginBottom: '8px',
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fde68a',
                    borderRadius: '8px'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <button onClick={() => moveMenuItem(item.id, 'up')} disabled={index === 0} style={arrowBtnStyle(index === 0)}>▲</button>
                      <button onClick={() => moveMenuItem(item.id, 'down')} disabled={index === ctaItems.length - 1} style={arrowBtnStyle(index === ctaItems.length - 1)}>▼</button>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '500', fontSize: '14px', color: '#111827' }}>{item.label} <span style={{ fontSize: '10px', padding: '2px 6px', backgroundColor: '#fef3c7', color: '#b45309', borderRadius: '4px' }}>CTA</span></div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.url}</div>
                    </div>
                    <button onClick={() => startEditMenuItem(item)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', color: '#6b7280' }}>✏️</button>
                    <button onClick={() => deleteMenuItem(item.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', color: '#ef4444' }}>🗑️</button>
                  </div>
                ))}
                {ctaItems.length === 0 && <p style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>No CTA buttons yet</p>}
              </div>
            </div>
          </div>

          {/* Footer Quick Links Card */}
          <div style={cardStyle}>
            <div style={cardHeaderStyle('#10b981')}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#065f46' }}>Footer Quick Links</h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>Manage footer navigation</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setShowAddLink(true)} style={buttonStyle('#10b981')}>+ Add</button>
                {footerDirty && <button onClick={saveQuickLinks} disabled={saving} style={buttonStyle('#f59e0b', saving)}>Save</button>}
              </div>
            </div>

            <div style={{ padding: '16px', maxHeight: '400px', overflowY: 'auto' }}>
              {quickLinks.map((link, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  marginBottom: '8px',
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <button onClick={() => moveQuickLink(index, 'up')} disabled={index === 0} style={arrowBtnStyle(index === 0)}>▲</button>
                    <button onClick={() => moveQuickLink(index, 'down')} disabled={index === quickLinks.length - 1} style={arrowBtnStyle(index === quickLinks.length - 1)}>▼</button>
                  </div>

                  {editingLinkIndex === index ? (
                    <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) => updateQuickLink(index, 'label', e.target.value)}
                        style={{ ...inputStyle, width: '120px' }}
                        placeholder="Label"
                      />
                      <input
                        type="text"
                        value={link.url}
                        onChange={(e) => updateQuickLink(index, 'url', e.target.value)}
                        style={{ ...inputStyle, flex: 1, minWidth: '100px' }}
                        placeholder="URL"
                      />
                      <button onClick={() => setEditingLinkIndex(null)} style={{ ...buttonStyle('#22c55e'), padding: '6px 12px' }}>Done</button>
                    </div>
                  ) : (
                    <>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: '500', fontSize: '14px', color: '#111827' }}>{link.label}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link.url} ↗</div>
                      </div>
                      <button onClick={() => setEditingLinkIndex(index)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', color: '#6b7280' }}>✏️</button>
                      <button onClick={() => deleteQuickLink(index)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', color: '#ef4444' }}>🗑️</button>
                    </>
                  )}
                </div>
              ))}
              {quickLinks.length === 0 && <p style={{ textAlign: 'center', color: '#9ca3af', padding: '40px' }}>No quick links yet. Add your first footer link.</p>}
            </div>
          </div>
        </div>

        {/* Board of Directors Card - Full Width */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle('#8b5cf6')}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#5b21b6' }}>Board of Directors</h3>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>Edit the About page board section</p>
            </div>
            <button onClick={saveBoardContent} disabled={saving} style={buttonStyle('#8b5cf6', saving)}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {/* Image Section */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Board Group Image URL
              </label>
              <input
                type="text"
                value={boardImage}
                onChange={(e) => setBoardImage(e.target.value)}
                placeholder="/images/about/getfund-7th-board-inauguration.jpg"
                style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
              />
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Enter the path to the board group photo</p>

              {boardImage && (
                <div style={{ marginTop: '16px' }}>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Preview:</p>
                  <div style={{
                    width: '100%',
                    height: '180px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid #e5e7eb'
                  }}>
                    <img
                      src={boardImage.startsWith('http') ? boardImage : `https://getfund.gov.gh${boardImage}`}
                      alt="Board preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/400x180?text=Image+Not+Found';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Board Description */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Board Description
              </label>
              <textarea
                value={boardDescription}
                onChange={(e) => setBoardDescription(e.target.value)}
                rows={3}
                placeholder="Brief description of the Board of Trustees..."
                style={{ ...inputStyle, width: '100%', resize: 'vertical', boxSizing: 'border-box' }}
              />
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                Plain text only. Board members list is managed separately.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Add Menu Item Modal */}
      {showAddMenu && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '16px'
        }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '600' }}>
              Add {newMenuItem.item_type === 'cta' ? 'CTA Button' : 'Menu Item'}
            </h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Label</label>
              <input
                type="text"
                value={newMenuItem.label}
                onChange={(e) => setNewMenuItem({ ...newMenuItem, label: e.target.value })}
                style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
                placeholder="e.g., About Us"
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>URL</label>
              <input
                type="text"
                value={newMenuItem.url}
                onChange={(e) => setNewMenuItem({ ...newMenuItem, url: e.target.value })}
                style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
                placeholder="e.g., /about"
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => { setShowAddMenu(false); setNewMenuItem({ label: '', url: '', item_type: 'menu' }); }} style={{ ...buttonStyle('#6b7280') }}>Cancel</button>
              <button onClick={addMenuItem} disabled={saving} style={buttonStyle('#3b82f6', saving)}>{saving ? 'Adding...' : 'Add Item'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Quick Link Modal */}
      {showAddLink && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '16px'
        }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '600' }}>Add Quick Link</h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Label</label>
              <input
                type="text"
                value={newLink.label}
                onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
                style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
                placeholder="e.g., Privacy Policy"
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>URL</label>
              <input
                type="text"
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
                placeholder="e.g., /privacy"
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => { setShowAddLink(false); setNewLink({ label: '', url: '' }); }} style={{ ...buttonStyle('#6b7280') }}>Cancel</button>
              <button onClick={addQuickLink} style={buttonStyle('#10b981')}>Add Link</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

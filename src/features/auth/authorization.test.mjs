import assert from 'node:assert/strict';
import test from 'node:test';
import { authorize } from './authorization-core.ts';

test('effective permissions are exact and independent of role', () => {
  const auth = authorize({ roles: ['ADMIN'], permissions: ['sales.view', 'inventory.view'] });
  assert.equal(auth.hasPermission('sales.view'), true);
  assert.equal(auth.hasPermission('sales.create'), false);
  assert.equal(auth.hasPermission('sales'), false);
  assert.equal(auth.hasAnyPermission(['sales.create', 'inventory.view']), true);
  assert.equal(auth.hasAllPermissions(['sales.view', 'inventory.view']), true);
  assert.equal(auth.hasAllPermissions(['sales.view', 'sales.create']), false);
});

test('multi-role users retain both roles and anonymous access is denied', () => {
  const auth = authorize({ roles: ['BRANCH_OWNER', 'CUSTOMER'], permissions: ['product.create'] });
  assert.equal(auth.hasRole('BRANCH_OWNER'), true);
  assert.equal(auth.hasRole('CUSTOMER'), true);
  assert.equal(auth.hasAnyRole(['STAFF', 'CUSTOMER']), true);
  assert.equal(auth.hasAnyRole(['ADMIN', 'STAFF']), false);
  assert.equal(auth.hasPermission('product.create'), true);
  assert.equal(authorize(null).hasPermission('product.create'), false);
  assert.equal(authorize(null).hasRole('CUSTOMER'), false);
});

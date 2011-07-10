/**
 * A plane in 3D space.  Created from the generalized plane equation coefficients
 * @param {number} a A plane coefficient of Ax + By + Cz + D = 0
 * @param {number} b B plane coefficient of Ax + By + Cz + D = 0
 * @param {number} c C plane coefficient of Ax + By + Cz + D = 0
 * @param {number} d D plane coefficient of Ax + By + Cz + D = 0
 * @constructor
 */
function Plane(a, b, c, d) {

	/**
	 * The A coefficent of the generalized plane equation Ax + By + Cz + D = 0
	 * @type {number}
	 */
	this.a = a;

	/**
	 * The B coefficent of the generalized plane equation Ax + By + Cz + D = 0
	 * @type {number}
	 */
	this.b = b;

	/**
	 * The C coefficent of the generalized plane equation Ax + By + Cz + D = 0
	 * @type {number}
	 */
	this.c = c;

	/**
	 * The D coefficent of the generalized plane equation Ax + By + Cz + D = 0
	 * @type {number}
	 */
	this.d = d;

	/**
	 * The normal to the plane
	 * @type {Vector3}
	 */
	this.normal = new Vector3(this.a, this.b, this.c);
};

/**
 * Given 3 points lying on the plane, returns a Plane instance.  The normal to the 
 * plane is normalized and is created by (p1 - p0) X (p2 - p0)
 * @param {Vector3} p0
 * @param {Vector3} p1
 * @param {Vector3} p2
 * @return {Plane}
 */
Plane.createFromPoints = function(p0, p1, p2) {
	var u = p1.subtract(p0);
	var v = p2.subtract(p0);
	var n = u.cross(v);
	n = n.normalize();
	
	var d = -1 * (n.x * p0.x + n.y * p0.y + n.z * p0.z);
	return new Plane(n.x, n.y, n.z, d);
};

/**
 * Given the plane normal and a point on the plane returns a Plane instance
 * @param {Vector3} point A point that lies on the plane
 * @param {Vector3} normal The normal to the plane - IMPORTANT: must be normalized
 * @return {Plane}
 */
Plane.createFromPointAndNormal = function(point, normal) {
	
	var d = -1 * (normal.x * point.x + normal.y * point.y + normal.z * point.z);
	return new Plane(normal.x, normal.y, normal.z, d);
};

Plane.prototype = {

	/**
	 * Transforms the plane normal by the specified transform matrix and returns a new normal
	 * @param {Matrix4x4} transform A transform to apply to the plane normal
	 * @return {Vector3}
	 */
	transformNormal: function(transform) {

		//Plane normal must be transformed by transpose(inverse(M)) to be correct
		var m = transform.inverse().transpose();
		var n = m.transformVector3(this.normal);
		return new Vector3(n.x, n.y, n.z);
	},

	/**
	 * Returns a string containing the generalized plane equation coefficients, A, B, C and D
	 * @return {string}
	 */
	toString: function() {
		return 'A:' + this.a + ', B:' + this.b + ', C:' + this.c + ', D:' + this.d;
	}
};




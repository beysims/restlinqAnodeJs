
function HitResult()
{
	this.distance = 0.0;
	this.param    = new Vector2(0,0);
    this.closest  = new Vector3(0,0,0);
    this.local    = new Vector3(0,0,0);
    this.object   = null;
}

function Ray(pos,dir)
{
    this.pos = pos;
    this.dir = dir;
}

Ray.prototype.intersectLine = function (p1, p2, tolerance) {
    var p3 = this.pos;
    var p4 = p3.add(this.dir); // substitute: p4 - p3 = dir

    var p13 = new Vector3;
    var p43 = new Vector3;
    var p21 = new Vector3;

    var d1343, d4321, d1321, d4343, d2121;
    var numer, denom, ta, tb;
    var epsilon = 0.000001;

    p13.x = p1.x - p3.x;
    p13.y = p1.y - p3.y;
    p13.z = p1.z - p3.z;
    p43.x = p4.x - p3.x;
    p43.y = p4.y - p3.y;
    p43.z = p4.z - p3.z;

    if (MathHelper.abs(p43.x) < epsilon &&
        MathHelper.abs(p43.y) < epsilon &&
        MathHelper.abs(p43.z) < epsilon) return null;

    p21.x = p2.x - p1.x;
    p21.y = p2.y - p1.y;
    p21.z = p2.z - p1.z;

    if (MathHelper.abs(p21.x) < epsilon &&
        MathHelper.abs(p21.y) < epsilon &&
        MathHelper.abs(p21.z) < epsilon) return null;

    d1343 = p13.x * p43.x + p13.y * p43.y + p13.z * p43.z;
    d4321 = p43.x * p21.x + p43.y * p21.y + p43.z * p21.z;
    d1321 = p13.x * p21.x + p13.y * p21.y + p13.z * p21.z;
    d4343 = p43.x * p43.x + p43.y * p43.y + p43.z * p43.z;
    d2121 = p21.x * p21.x + p21.y * p21.y + p21.z * p21.z;

    denom = d2121 * d4343 - d4321 * d4321;
    if (MathHelper.abs(denom) < epsilon) return null;

    numer = d1343 * d4321 - d1321 * d4343;

    ta = numer / denom;
    tb = (d1343 + d4321 * (ta)) / d4343;

    if (ta < 0 || ta > 1) return null; //not on segment
    if (tb < 0) return null; // before start of ray

    var pa = new Vector3(0, 0, 0); // closest pt on ray to line
    var pb = new Vector3(0, 0, 0); // closest pt on line to ray

    pb.x = p3.x + tb * p43.x;
    pb.y = p3.y + tb * p43.y;
    pb.z = p3.z + tb * p43.z;
        
    pa.x = p1.x + ta * p21.x;
    pa.y = p1.y + ta * p21.y;
    pa.z = p1.z + ta * p21.z;

    var diff = pa.subtract(pb);
    var D = diff.lengthSquared();

    if (D < (tolerance * tolerance)) {
        var result = new HitResult();
        result.param.x = 0;
        result.param.y = ta;
        result.distance = Math.sqrt(D);
        result.closest = pa;
        result.local = pb;
        return result;
    }
    return null;
}

Ray.prototype.intersectQuad = function(result, v1, v2, v3, v4)
{
   var edge1, edge2, tvec, pvec, qvec;
   var det, idet;
   var epsilon = 0.0001;

   /* find vectors for two edges sharing v0 */
   edge1 = v2.subtract(v3); //Sub(edge1, v2, v3);
   edge2 = v2.subtract(v1); //Sub(edge2, v2, v1);

   /* begin calculating determinant - also used to calculate U parameter */
   pvec = this.dir.cross(edge2); //Cross(pvec, dir, edge2);

   /* if determinant is near zero, ray lies in plane of triangle */
   det = edge1.dot(pvec); //Dot(edge1, pvec);

   if (det > -epsilon && det < epsilon) return null;
   idet = 1.0 / det;

   /* calculate result.length from v0 to ray origin */
   tvec = this.pos.subtract(v0); //Sub(tvec, pos, v0);

   /* calculate U parameter and test bounds */
   result.param.s = tvec.dot(pvec) * idet;
   if (result.param.s < 0.0 || result.param.s > 1.0) return null;

   /* prepare to test V parameter */
   qvec = tvec.cross(edge1);

   /* calculate V parameter and test bounds */
   result.param.t = dir.dot(qvec) * idet;
   if (result.param.t < 0.0 || result.param.t > 1.0) return null;

   /* calculate t, ray intersects triangle */
   result.distance = edge2.dot(qvec) * idet;
   result.local    = v0 + (edge1 * result.param.s) + (edge2 * result.param.t);

   return result;
}

Ray.prototype.intersectSphere = function(result, sphere)
{
	var  dist = this.pos.subtract(sphere.pos);
	var B = dist.dot(ray.dir);
	var C = dist.dot(dist) - (sphere.rad*sphere.rad);
	var D = B * B - C;

	if (D > 0)
	{
		var t1, t0;

		t0 = Math.sqrt(Math.abs(-B - (B*B - 4*C))) / 2.0;
		if (t0 > 0) 
		{
			result.world = this.pos + this.dir * t0;
		}
		else
		{
			t1 = Math.sqrt(Math.abs(-B + (B*B - 4*C))) / 2.0;
			result.world = this.pos + this.dir * t1;
		}
		return result;
	}

	return null;

	//return (D > 0 ? -B -sqrt(D) : 0); //std::numeric_limits<float>::infinity());
}

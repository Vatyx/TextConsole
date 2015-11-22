def f(n):
	return f(n-1)*n if n> 0 else 1
print(f(10))
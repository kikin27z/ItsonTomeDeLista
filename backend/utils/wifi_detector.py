import ipaddress

def ip_in_range(ip, ip_range):
    ip_obj = ipaddress.ip_address(ip)
    network = ipaddress.ip_network(ip_range, strict=False)
    return ip_obj in network

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip
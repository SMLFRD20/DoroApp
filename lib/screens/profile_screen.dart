import 'dart:io';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:image_picker/image_picker.dart';
import '../services/auth_provider.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  Future<void> _handleLogout(BuildContext context) async {
    final authNotifier = context.read<AuthNotifier>();
    final router = GoRouter.of(context);
    await authNotifier.signOut();
    router.go('/');
  }

  Future<void> _handleDeleteAccount(BuildContext context) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Theme.of(context).colorScheme.surface,
        title: const Text('¿Eliminar cuenta?'),
        content: const Text('Esta acción no se puede deshacer. Todos tus datos se perderán para siempre.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text('Cancelar', style: TextStyle(color: Theme.of(context).textTheme.bodyMedium?.color)),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: Theme.of(context).colorScheme.error,
              foregroundColor: Theme.of(context).colorScheme.onError,
            ),
            child: const Text('Eliminar'),
          ),
        ],
      ),
    );

    if (confirm == true && context.mounted) {
      try {
        final authNotifier = context.read<AuthNotifier>();
        final router = GoRouter.of(context);
        final supabase = Supabase.instance.client;
        final user = supabase.auth.currentUser;
        if (user != null) {
          await supabase.from('profiles').delete().eq('id', user.id);
          await authNotifier.signOut();
          if (context.mounted) {
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Cuenta eliminada correctamente')));
            router.go('/');
          }
        }
      } catch (e) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error: $e'), backgroundColor: Theme.of(context).colorScheme.error),
          );
        }
      }
    }
  }

  Future<void> _showEditProfileModal(BuildContext context, String currentName, String? currentAvatarUrl) async {
    final controller = TextEditingController(text: currentName);
    bool isLoading = false;
    File? newAvatarFile;
    
    await showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setState) {
            return AlertDialog(
              backgroundColor: Theme.of(context).colorScheme.surface,
              title: const Text('Editar Perfil'),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  GestureDetector(
                    onTap: () async {
                      final ImagePicker picker = ImagePicker();
                      final XFile? image = await picker.pickImage(source: ImageSource.gallery);
                      if (image != null) {
                        setState(() => newAvatarFile = File(image.path));
                      }
                    },
                    child: CircleAvatar(
                      radius: 40,
                      backgroundColor: Theme.of(context).colorScheme.primary.withValues(alpha: 0.1),
                      backgroundImage: newAvatarFile != null 
                          ? FileImage(newAvatarFile!) 
                          : (currentAvatarUrl != null ? NetworkImage(currentAvatarUrl) : null) as ImageProvider?,
                      child: newAvatarFile == null && currentAvatarUrl == null
                          ? Icon(LucideIcons.camera, color: Theme.of(context).colorScheme.primary)
                          : null,
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: controller,
                    decoration: InputDecoration(
                      labelText: 'Nombre',
                      filled: true,
                      fillColor: Theme.of(context).scaffoldBackgroundColor,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    textCapitalization: TextCapitalization.words,
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: isLoading ? null : () => Navigator.pop(context),
                  child: Text('Cancelar', style: TextStyle(color: Theme.of(context).textTheme.bodyMedium?.color)),
                ),
                ElevatedButton(
                  onPressed: isLoading ? null : () async {
                    final newName = controller.text.trim();
                    if ((newName.isEmpty || newName == currentName) && newAvatarFile == null) {
                      Navigator.pop(context);
                      return;
                    }
                    setState(() => isLoading = true);
                    try {
                      String? avatarUrl = currentAvatarUrl;
                      final supabase = Supabase.instance.client;
                      final user = supabase.auth.currentUser;

                      if (newAvatarFile != null && user != null) {
                        final fileExt = newAvatarFile!.path.split('.').last;
                        final fileName = '${user.id}_${DateTime.now().millisecondsSinceEpoch}.$fileExt';
                        try {
                          await supabase.storage.from('avatars').upload(fileName, newAvatarFile!);
                          avatarUrl = supabase.storage.from('avatars').getPublicUrl(fileName);
                        } catch (e) {
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error al subir foto (¿Existe el bucket "avatars"?): $e')));
                          }
                        }
                      }

                      await supabase.auth.updateUser(
                        UserAttributes(data: {
                          'first_name': newName,
                          ... (avatarUrl != null ? {'avatar_url': avatarUrl} : {}),
                        }),
                      );
                      if (context.mounted) {
                        await context.read<AuthNotifier>().refreshSession();
                        if (context.mounted) {
                           ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Perfil actualizado')));
                           Navigator.pop(context);
                        }
                      }
                    } catch (e) {
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
                      }
                    } finally {
                      if (context.mounted) setState(() => isLoading = false);
                    }
                  },
                  style: ElevatedButton.styleFrom(backgroundColor: Theme.of(context).colorScheme.primary, foregroundColor: Colors.white),
                  child: isLoading ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)) : const Text('Guardar'),
                ),
              ],
            );
          }
        );
      },
    );
  }

  void _showNotificationsModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Theme.of(context).colorScheme.surface,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setState) {
            return SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Notificaciones', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 24),
                    SwitchListTile(
                      title: const Text('Recordatorios de enfoque'),
                      subtitle: const Text('Te avisamos cuando es hora de trabajar'),
                      value: true,
                      onChanged: (val) {},
                      activeThumbColor: Theme.of(context).colorScheme.primary,
                      contentPadding: EdgeInsets.zero,
                    ),
                    SwitchListTile(
                      title: const Text('Resumen semanal'),
                      subtitle: const Text('Recibe tus estadísticas de productividad'),
                      value: false,
                      onChanged: (val) {},
                      activeThumbColor: Theme.of(context).colorScheme.primary,
                      contentPadding: EdgeInsets.zero,
                    ),
                    SwitchListTile(
                      title: const Text('Sonidos de temporizador'),
                      subtitle: const Text('Alertas al terminar cada sesión'),
                      value: true,
                      onChanged: (val) {},
                      activeThumbColor: Theme.of(context).colorScheme.primary,
                      contentPadding: EdgeInsets.zero,
                    ),
                    const SizedBox(height: 16),
                  ],
                ),
              ),
            );
          }
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final authState = context.watch<AuthNotifier>();
    final user = authState.session?.user;
    final firstName = user?.userMetadata?['first_name'] ?? 'Usuario';
    final avatarUrl = user?.userMetadata?['avatar_url'];
    final email = user?.email ?? '';

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 20),
              Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                  border: Border.all(color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.3), width: 2),
                  image: avatarUrl != null ? DecorationImage(image: NetworkImage(avatarUrl), fit: BoxFit.cover) : null,
                ),
                child: avatarUrl == null 
                  ? Center(
                      child: Text(
                        firstName.isNotEmpty ? firstName[0].toUpperCase() : 'U', 
                        style: TextStyle(fontSize: 40, fontWeight: FontWeight.bold, color: Theme.of(context).colorScheme.primary)
                      ),
                    )
                  : null,
              ),
              const SizedBox(height: 24),
              Text(firstName, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              Text(email, style: TextStyle(fontSize: 14, color: Theme.of(context).textTheme.bodyMedium?.color?.withValues(alpha: 0.6))),
              
              const SizedBox(height: 48),
              
              _SettingsGroup(
                title: 'CUENTA',
                children: [
                  _SettingsTile(
                    icon: LucideIcons.user,
                    title: 'Editar Perfil',
                    onTap: () => _showEditProfileModal(context, firstName, avatarUrl),
                  ),
                  _SettingsTile(
                    icon: LucideIcons.bell,
                    title: 'Notificaciones',
                    onTap: () => _showNotificationsModal(context),
                  ),
                ],
              ),
              
              const SizedBox(height: 24),
              
              _SettingsGroup(
                title: 'APP',
                children: [
                  _SettingsTile(
                    icon: LucideIcons.settings,
                    title: 'Configuración General',
                    onTap: () {},
                  ),
                  _SettingsTile(
                    icon: Icons.help_outline,
                    title: 'Ayuda y Soporte',
                    onTap: () {},
                  ),
                ],
              ),
              
              const SizedBox(height: 48),
              
              ElevatedButton.icon(
                onPressed: () => _handleLogout(context),
                icon: const Icon(LucideIcons.log_out),
                label: const Text('Cerrar Sesión', style: TextStyle(fontWeight: FontWeight.w600)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Theme.of(context).colorScheme.surface,
                  foregroundColor: Theme.of(context).textTheme.bodyMedium?.color,
                  minimumSize: const Size(double.infinity, 56),
                  elevation: 0,
                  side: BorderSide(color: Theme.of(context).colorScheme.secondary.withValues(alpha: 0.5)),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
              ),
              
              const SizedBox(height: 16),
              
              TextButton(
                onPressed: () => _handleDeleteAccount(context),
                style: TextButton.styleFrom(
                  foregroundColor: Theme.of(context).colorScheme.error,
                  minimumSize: const Size(double.infinity, 56),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: const Text('Eliminar cuenta', style: TextStyle(fontWeight: FontWeight.w600)),
              ),
              
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }
}

class _SettingsGroup extends StatelessWidget {
  final String title;
  final List<Widget> children;

  const _SettingsGroup({required this.title, required this.children});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 16, bottom: 8),
          child: Text(title, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1.0, color: Theme.of(context).textTheme.bodyMedium?.color?.withValues(alpha: 0.5))),
        ),
        Container(
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.surface,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: Theme.of(context).colorScheme.secondary.withValues(alpha: 0.5)),
            boxShadow: [
              BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 10, offset: const Offset(0, 4))
            ],
          ),
          child: Column(children: children),
        ),
      ],
    );
  }
}

class _SettingsTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final VoidCallback onTap;

  const _SettingsTile({required this.icon, required this.title, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: Theme.of(context).colorScheme.primary, size: 20),
      ),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.w500)),
      trailing: Icon(LucideIcons.chevron_right, size: 20, color: Theme.of(context).textTheme.bodyMedium?.color?.withValues(alpha: 0.3)),
      onTap: onTap,
    );
  }
}
